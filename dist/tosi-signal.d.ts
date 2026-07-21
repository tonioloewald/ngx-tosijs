import { Signal, Injector } from "@angular/core";
import type { XinTouchableType } from "tosijs";
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
export declare const tosiSignal: <T = any>(observed: XinTouchableType, options?: TosiSignalOptions<T>) => TosiSignal<T>;
