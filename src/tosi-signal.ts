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
 * A writable signal bound to a tosijs path. Templates, computed(), and
 * effect() track it like any signal; set/update write through to the
 * shared state, and mutations from ANYWHERE — other components, other
 * frameworks, vanilla JS, the console — propagate back in. isSignal()
 * returns false for it (it wraps an internal signal), but tracking works
 * because reading it reads the internal signal.
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
  const read = (): T =>
    xin[path] !== undefined ? xin[path] : (options.initialValue as T);

  // objects and functions always propagate on touch — in-place mutation
  // preserves identity, so equality can't distinguish touch-worthy
  // changes; primitives dedupe no-op touches via Object.is
  const inner = signal<T>(read(), {
    equal: (a, b) =>
      (typeof b === "object" && b !== null) || typeof b === "function"
        ? false
        : Object.is(a, b),
  });

  const listener = observe(path, () => {
    inner.set(read());
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

  const out = (() => inner()) as TosiSignal<T>;
  out.set = (value: T) => {
    xin[path] = value;
  };
  out.update = (updater) => {
    out.set(updater(inner()));
  };
  out.asReadonly = () => inner.asReadonly();
  out.destroy = destroy;
  return out;
};
