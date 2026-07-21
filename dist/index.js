// src/tosi-signal.ts
import { signal, DestroyRef, inject } from "@angular/core";
import * as tosijs2 from "tosijs";

// src/tosijs-shims.ts
import * as tosijs from "tosijs";
var _resolvePathOf = (t) => {
  const fn = t.tosiPath ?? t.xinPath;
  if (fn === undefined) {
    throw new Error("ngx-tosijs requires tosijs ^1.0.6 (found neither tosiPath nor xinPath export)");
  }
  return fn;
};
var _resolveValueOf = (t) => {
  const fn = t.tosiValue ?? t.xinValue;
  if (fn === undefined) {
    throw new Error("ngx-tosijs requires tosijs ^1.0.6 (found neither tosiValue nor xinValue export)");
  }
  return fn;
};
var pathOf = _resolvePathOf(tosijs);
var valueOf = _resolveValueOf(tosijs);

// src/tosi-signal.ts
var { xin, observe, unobserve } = tosijs2;
var BAD_ARGUMENT = "tosiSignal must either be passed a path or a tosijs proxy";
var tosiSignal = (observed, options = {}) => {
  const path = typeof observed === "string" ? observed : pathOf(observed);
  if (typeof path !== "string") {
    console.error(BAD_ARGUMENT, observed);
    throw new Error(BAD_ARGUMENT);
  }
  const read = () => xin[path] !== undefined ? xin[path] : options.initialValue;
  const inner = signal(read(), {
    equal: (a, b) => typeof b === "object" && b !== null || typeof b === "function" ? false : Object.is(a, b)
  });
  const listener = observe(path, () => {
    inner.set(read());
  });
  const destroy = () => {
    unobserve(listener);
  };
  if (!options.manualCleanup) {
    const destroyRef = options.injector ? options.injector.get(DestroyRef) : inject(DestroyRef);
    destroyRef.onDestroy(destroy);
  }
  const out = () => inner();
  out.set = (value) => {
    xin[path] = value;
  };
  out.update = (updater) => {
    out.set(updater(inner()));
  };
  out.asReadonly = () => inner.asReadonly();
  out.destroy = destroy;
  return out;
};
// src/provide-tosi.ts
import { APP_INITIALIZER, NgZone, inject as inject2 } from "@angular/core";
import * as tosijs3 from "tosijs";
var { observe: observe2 } = tosijs3;
var provideTosi = () => ({
  provide: APP_INITIALIZER,
  multi: true,
  useFactory: () => {
    const zone = inject2(NgZone);
    return () => {
      let queued = false;
      observe2(/^./, () => {
        if (!queued) {
          queued = true;
          queueMicrotask(() => {
            queued = false;
            zone.run(() => {});
          });
        }
      });
    };
  }
});
// src/paths.ts
var typedTosi = () => ({
  tosiSignal: (path, options) => tosiSignal(path, options)
});
// src/persist.ts
import * as tosijs4 from "tosijs";
var { xin: xin2, observe: observe3, unobserve: unobserve2 } = tosijs4;
var persist = (observed, options = {}) => {
  const path = typeof observed === "string" ? observed : pathOf(observed);
  if (typeof path !== "string") {
    throw new Error("persist must be passed a path or a tosijs proxy");
  }
  const storage = options.storage ?? globalThis.localStorage;
  if (storage === undefined) {
    throw new Error(`persist: no storage available for ${path} — pass options.storage in non-browser environments`);
  }
  const key = options.key ?? `tosijs:${path}`;
  const stored = storage.getItem(key);
  if (stored !== null) {
    try {
      xin2[path] = JSON.parse(stored);
    } catch (error) {
      console.error(`persist: ignoring unparseable stored value for ${key}`, error);
    }
  }
  let writeQueued = false;
  let stopped = false;
  const write = () => {
    writeQueued = false;
    if (stopped)
      return;
    try {
      const json = JSON.stringify(valueOf(xin2[path]));
      storage.setItem(key, json === undefined ? "null" : json);
    } catch (error) {
      console.error(`persist: could not store value for ${key}`, error);
    }
  };
  const listener = observe3(path, () => {
    if (!writeQueued) {
      writeQueued = true;
      queueMicrotask(write);
    }
  });
  return () => {
    stopped = true;
    unobserve2(listener);
  };
};
// src/devtools.ts
import * as tosijs5 from "tosijs";
var { xin: xin3, observe: observe4, unobserve: unobserve3 } = tosijs5;
var connectDevTools = ({
  name = "tosijs",
  roots
}) => {
  const extension = globalThis.__REDUX_DEVTOOLS_EXTENSION__;
  if (!extension) {
    return () => {};
  }
  const connection = extension.connect({ name });
  const snapshot = () => Object.fromEntries(roots.map((root) => [root, valueOf(xin3[root])]));
  connection.init(snapshot());
  const listeners = roots.map((root) => observe4(root, (path) => {
    connection.send({ type: path }, snapshot());
  }));
  return () => {
    for (const listener of listeners) {
      unobserve3(listener);
    }
    connection.unsubscribe?.();
  };
};
// src/version.ts
var version = "0.9.0";
export {
  version,
  valueOf,
  typedTosi,
  tosiSignal,
  provideTosi,
  persist,
  pathOf,
  connectDevTools,
  _resolveValueOf,
  _resolvePathOf
};

//# debugId=A81C468F47C37A2A64756E2164756E21
//# sourceMappingURL=index.js.map
