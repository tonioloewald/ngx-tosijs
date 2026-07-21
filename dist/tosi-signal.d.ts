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
export declare const tosiSignal: <T = any>(observed: XinTouchableType, options?: TosiSignalOptions<T>) => TosiSignal<T>;
