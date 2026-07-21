import { describe, test, expect } from "bun:test";
import { runInInjectionContext, Injector, NgZone, isSignal } from "@angular/core";
import { xinProxy, updates, touch } from "tosijs";
import {
  tosiSignal,
  typedTosi,
  provideTosi,
  _resolvePathOf,
  _resolveValueOf,
} from "../src/index";

const { ngstate } = xinProxy({
  ngstate: {
    greeting: "hello",
    count: 0,
    todos: [{ id: 1, text: "write tests" }] as { id: number; text: string }[],
  },
});

const makeFakeInjector = () => {
  const destroyCallbacks: Array<() => void> = [];
  const injector = {
    get: () => ({ onDestroy: (cb: () => void) => destroyCallbacks.push(cb) }),
  } as unknown as Injector;
  return { injector, destroy: () => destroyCallbacks.forEach((cb) => cb()) };
};

describe("tosiSignal", () => {
  test("reads the current value at a path", () => {
    const greeting = tosiSignal<string>("ngstate.greeting", {
      manualCleanup: true,
    });
    expect(greeting()).toBe("hello");
    greeting.destroy();
  });

  test("falls back to initialValue on empty paths", () => {
    const missing = tosiSignal<string>("ngstate.missing", {
      initialValue: "default",
      manualCleanup: true,
    });
    expect(missing()).toBe("default");
    missing.destroy();
  });

  test("updates when state is mutated outside Angular", async () => {
    const count = tosiSignal<number>("ngstate.count", { manualCleanup: true });
    expect(count()).toBe(0);
    ngstate.count = 17;
    await updates();
    expect(count()).toBe(17);
    count.destroy();
  });

  test("set and update write through to shared state", async () => {
    const greeting = tosiSignal<string>("ngstate.greeting", {
      manualCleanup: true,
    });
    greeting.set("goodbye");
    expect(String(ngstate.greeting)).toBe("goodbye");
    await updates();
    expect(greeting()).toBe("goodbye");
    greeting.update((value) => value + "!");
    expect(String(ngstate.greeting)).toBe("goodbye!");
    await updates();
    expect(greeting()).toBe("goodbye!");
    greeting.destroy();
  });

  test("in-place array mutation propagates", async () => {
    const todos = tosiSignal<{ id: number; text: string }[]>("ngstate.todos", {
      manualCleanup: true,
    });
    ngstate.todos.push({ id: 2, text: "pushed in place" });
    await updates();
    expect(todos().map((item) => item.text)).toContain("pushed in place");
    todos.destroy();
  });

  test("accepts a tosijs proxy instead of a path", async () => {
    const todos = tosiSignal(ngstate.todos, { manualCleanup: true });
    expect(todos().length).toBeGreaterThan(0);
    todos.destroy();
  });

  test("destroy stops updates", async () => {
    const count = tosiSignal<number>("ngstate.count", { manualCleanup: true });
    const before = count();
    count.destroy();
    ngstate.count = before + 100;
    await updates();
    expect(count()).toBe(before);
  });

  test("cleans up via the injector's DestroyRef", async () => {
    const { injector, destroy } = makeFakeInjector();
    const count = tosiSignal<number>("ngstate.count", { injector });
    const seen = count();
    destroy();
    ngstate.count = seen + 50;
    await updates();
    expect(count()).toBe(seen);
  });

  // regression tests for the 0.9.0 stale-update() bug: NO intervening
  // `await updates()` — writes in the same tick must compose

  test("two synchronous update() calls both apply", async () => {
    ngstate.count = 0;
    await updates();
    const count = tosiSignal<number>("ngstate.count", { manualCleanup: true });
    count.update((c) => c + 1);
    count.update((c) => c + 1);
    expect(Number(ngstate.count)).toBe(2);
    await updates();
    expect(count()).toBe(2);
    count.destroy();
  });

  test("set() then update() in the same tick compose", async () => {
    ngstate.count = 0;
    await updates();
    const count = tosiSignal<number>("ngstate.count", { manualCleanup: true });
    count.set(5);
    count.update((c) => c + 1);
    expect(Number(ngstate.count)).toBe(6);
    await updates();
    expect(count()).toBe(6);
    count.destroy();
  });

  test("external mutation then update() in the same tick compose", async () => {
    ngstate.count = 0;
    await updates();
    const count = tosiSignal<number>("ngstate.count", { manualCleanup: true });
    ngstate.count = 100;
    count.update((c) => c + 1);
    expect(Number(ngstate.count)).toBe(101);
    await updates();
    expect(count()).toBe(101);
    count.destroy();
  });

  test("a read immediately after set() sees the new value", () => {
    const count = tosiSignal<number>("ngstate.count", { manualCleanup: true });
    count.set(42);
    expect(count()).toBe(42); // no flush needed for local consistency
    count.destroy();
  });

  test("a TosiSignal is a real Angular signal (isSignal)", () => {
    const greeting = tosiSignal<string>("ngstate.greeting", {
      manualCleanup: true,
    });
    expect(isSignal(greeting)).toBe(true);
    greeting.destroy();
  });

  test("asReadonly returns a readable signal without setters", () => {
    const greeting = tosiSignal<string>("ngstate.greeting", {
      manualCleanup: true,
    });
    const readonly = greeting.asReadonly();
    expect(readonly()).toBe(greeting());
    expect((readonly as any).set).toBeUndefined();
    greeting.destroy();
  });

  test("throws when passed something that is neither path nor proxy", () => {
    const original = console.error;
    console.error = () => {};
    try {
      expect(() =>
        tosiSignal({ not: "a proxy" } as any, { manualCleanup: true }),
      ).toThrow("tosiSignal must either be passed a path or a tosijs proxy");
    } finally {
      console.error = original;
    }
  });
});

describe("typedTosi", () => {
  test("the typed facade works at runtime", () => {
    const { tosiSignal: typed } = typedTosi<{
      ngstate: { greeting: string };
    }>();
    const greeting = typed("ngstate.greeting", { manualCleanup: true });
    expect(greeting()).toBe(String(ngstate.greeting));
    greeting.destroy();
  });
});

describe("provideTosi (zone bridge)", () => {
  test("coalesces flush notifications into one zone entry", async () => {
    let zoneRuns = 0;
    const fakeZone = {
      run: (fn: () => void) => {
        zoneRuns++;
        return fn();
      },
    };
    const injector = Injector.create({
      providers: [{ provide: NgZone, useValue: fakeZone }],
    });
    const provider = provideTosi() as any;
    const initializer = runInInjectionContext(
      injector,
      provider.useFactory,
    ) as () => void;
    initializer();

    ngstate.count = 1000;
    ngstate.greeting = "zoned";
    await updates();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(zoneRuns).toBe(1);
  });
});

describe("compatibility shims", () => {
  test("prefer tosi-named exports, fall back to xin-named, throw on neither", () => {
    const a = (x: any) => x;
    const b = (x: any) => x;
    expect(_resolvePathOf({ tosiPath: a, xinPath: b })).toBe(a);
    expect(_resolvePathOf({ xinPath: b })).toBe(b);
    expect(() => _resolvePathOf({})).toThrow("ngx-tosijs requires tosijs ^1.0.6");
    expect(_resolveValueOf({ tosiValue: a, xinValue: b })).toBe(a);
    expect(_resolveValueOf({ xinValue: b })).toBe(b);
    expect(() => _resolveValueOf({})).toThrow("ngx-tosijs requires tosijs ^1.0.6");
  });
});
