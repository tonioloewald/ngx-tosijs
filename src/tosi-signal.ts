import { signal, Signal, DestroyRef, inject, Injector } from "@angular/core";
import * as tosijs from "tosijs";
import type { XinTouchableType } from "tosijs";
import { pathOf } from "./tosijs-shims";

const { xin, observe, unobserve } = tosijs;

const BAD_ARGUMENT = "tosiSignal must either be passed a path or a tosijs proxy";

export interface TosiSignalOptions<T> {
  initialValue?: T;
  /** resolve DestroyRef from this injector instead of the calling injection context */
  injector?: Injector;
  /** skip automatic cleanup; caller must call .destroy() */
  manualCleanup?: boolean;
}

/**
 * A writable signal bound to a tosijs path. It IS an Angular signal
 * (isSignal() is true; templates, computed(), and effect() track it
 * natively) whose set/update write through to the shared state — update
 * computes from live state, so same-tick writes compose correctly — and
 * mutations from ANYWHERE — other components, other frameworks, vanilla
 * JS, the console — propagate back in on the tosijs flush.
 */
export interface TosiSignal<T> extends Signal<T> {
  set(value: T): void;
  update(updater: (value: T) => T): void;
  asReadonly(): Signal<T>;
  /** unsubscribe from tosijs (automatic on destroy unless manualCleanup) */
  destroy(): void;
}

export const tosiSignal = <T = any>(
  observed: XinTouchableType,
  options: TosiSignalOptions<T> = {},
): TosiSignal<T> => {
  const path = typeof observed === "string" ? observed : pathOf(observed);
  if (typeof path !== "string") {
    console.error(BAD_ARGUMENT, observed);
    throw new Error(BAD_ARGUMENT);
  }
  const read = (): T => {
    const value = xin[path];
    return value !== undefined ? value : (options.initialValue as T);
  };

  // objects and functions always propagate on touch — in-place mutation
  // preserves identity, so equality can't distinguish touch-worthy
  // changes; primitives dedupe no-op touches via Object.is
  const inner = signal<T>(read(), {
    equal: (a, b) =>
      (typeof b === "object" && b !== null) || typeof b === "function"
        ? false
        : Object.is(a, b),
  });

  // capture the local setter BEFORE patching: the observer refreshes the
  // signal from tosijs with it, while the public set/update write through
  // to xin (the signal then updates on the flush)
  const applyLocal = inner.set.bind(inner);

  const listener = observe(path, () => {
    applyLocal(read());
  });
  const destroy = (): void => {
    unobserve(listener);
  };
  if (!options.manualCleanup) {
    const destroyRef = options.injector
      ? options.injector.get(DestroyRef)
      : inject(DestroyRef);
    destroyRef.onDestroy(destroy);
  }

  // the returned value IS the Angular signal (SIGNAL-branded, so
  // isSignal() is true and tracking is native) with writes redirected
  const out = inner as unknown as TosiSignal<T>;
  out.set = (value: T) => {
    xin[path] = value;
    // sync the local signal immediately so a read after set() sees the
    // new value (other observers of the path still update on the flush)
    applyLocal(read());
  };
  // update reads LIVE state (xin), not the signal — the signal only
  // refreshes on the async flush, and reading it here would silently
  // lose any same-tick writes
  out.update = (updater) => {
    out.set(updater(read()));
  };
  out.destroy = destroy;
  return out;
};
