import { describe, test, expect, afterEach, spyOn } from "bun:test";
import { xin, xinProxy, updates } from "tosijs";
import { persist, connectDevTools } from "../src/index";

const { persisted } = xinProxy({
  persisted: { count: 1, label: "hello", maybe: "present" as string | undefined },
  devtooled: { clicks: 0 },
});

const makeFakeStorage = (seed: Record<string, string> = {}) => {
  const data = new Map(Object.entries(seed));
  return {
    data,
    setCalls: 0,
    getItem(key: string) {
      return this.data.has(key) ? this.data.get(key)! : null;
    },
    setItem(key: string, value: string) {
      this.setCalls++;
      this.data.set(key, String(value));
    },
  };
};

// persist writes are coalesced to a microtask after the tosijs flush
const settle = async () => {
  await updates();
  await new Promise((resolve) => setTimeout(resolve, 0));
};

afterEach(() => {
  delete (globalThis as any).__REDUX_DEVTOOLS_EXTENSION__;
});

describe("persist", () => {
  test("writes changes to storage as raw JSON", async () => {
    const storage = makeFakeStorage();
    const stop = persist("persisted.count", { storage });
    persisted.count = 42;
    await settle();
    expect(storage.data.get("tosijs:persisted.count")).toBe("42");
    stop();
    persisted.count = 43;
    await settle();
    expect(storage.data.get("tosijs:persisted.count")).toBe("42");
  });

  test("coalesces sibling touches into one write per flush", async () => {
    const storage = makeFakeStorage();
    const stop = persist("persisted", { storage });
    const before = storage.setCalls;
    persisted.count = 100;
    persisted.label = "coalesced";
    await settle();
    expect(storage.setCalls - before).toBe(1);
    stop();
  });

  test("stores undefined as null rather than the string \"undefined\"", async () => {
    const storage = makeFakeStorage();
    const stop = persist("persisted.maybe", { storage });
    (persisted as any).maybe = undefined;
    await settle();
    expect(storage.data.get("tosijs:persisted.maybe")).toBe("null");
    // a future hydration parses cleanly
    expect(JSON.parse(storage.data.get("tosijs:persisted.maybe")!)).toBe(null);
    stop();
  });

  test("hydrates from storage on connect", () => {
    const storage = makeFakeStorage({ "custom-key": '"stored"' });
    const stop = persist("persisted.label", { storage, key: "custom-key" });
    expect(persisted.label).toBe("stored");
    stop();
  });

  test("ignores unparseable stored values", () => {
    const quiet = spyOn(console, "error").mockImplementation(() => {});
    try {
      const storage = makeFakeStorage({ "tosijs:persisted.label": "not json {" });
      const before = String(persisted.label);
      const stop = persist("persisted.label", { storage });
      expect(String(persisted.label)).toBe(before);
      expect(quiet).toHaveBeenCalled();
      stop();
    } finally {
      quiet.mockRestore();
    }
  });

  test("throws on a non-path argument", () => {
    expect(() => persist({ not: "a proxy" } as any)).toThrow(
      "persist must be passed a path or a tosijs proxy",
    );
  });

  test("throws an actionable error when no storage exists", () => {
    const saved = (globalThis as any).localStorage;
    try {
      Object.defineProperty(globalThis, "localStorage", {
        value: undefined,
        configurable: true,
      });
      expect(() => persist("persisted.count")).toThrow("pass options.storage");
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        value: saved,
        configurable: true,
      });
    }
  });
});

describe("connectDevTools", () => {
  test("no-ops without the extension", () => {
    const disconnect = connectDevTools({ roots: ["devtooled"] });
    expect(typeof disconnect).toBe("function");
    disconnect();
  });

  test("sends path-labelled actions with raw snapshots; disconnect stops them", async () => {
    const sent: Array<{ action: any; state: any }> = [];
    let inited: any = null;
    let unsubscribed = false;
    (globalThis as any).__REDUX_DEVTOOLS_EXTENSION__ = {
      connect: () => ({
        init: (state: any) => (inited = state),
        send: (action: any, state: any) => sent.push({ action, state }),
        unsubscribe: () => (unsubscribed = true),
      }),
    };
    const disconnect = connectDevTools({ name: "test", roots: ["devtooled"] });
    expect(inited.devtooled.clicks).toBeDefined();

    xin["devtooled.clicks"] = 7;
    await updates();
    expect(sent.length).toBeGreaterThan(0);
    const last = sent[sent.length - 1];
    expect(last.action.type).toBe("devtooled.clicks");
    expect(last.state.devtooled.clicks).toBe(7);

    // touches outside the declared roots are not sent
    let count = sent.length;
    xin["persisted.count"] = 999;
    await updates();
    expect(sent.length).toBe(count);

    disconnect();
    expect(unsubscribed).toBe(true);
    count = sent.length;
    xin["devtooled.clicks"] = 8;
    await updates();
    expect(sent.length).toBe(count);
  });
});

describe("persist storage access", () => {
  test("a throwing localStorage getter yields the actionable error", () => {
    const saved = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    try {
      Object.defineProperty(globalThis, "localStorage", {
        get() {
          throw new Error("SecurityError: denied");
        },
        configurable: true,
      });
      expect(() => persist("persisted.count")).toThrow("pass options.storage");
    } finally {
      if (saved) Object.defineProperty(globalThis, "localStorage", saved);
    }
  });
});
