import type { XinTouchableType } from "tosijs";
export interface PersistOptions {
    /** anything with localStorage's getItem/setItem (defaults to localStorage) */
    storage?: Pick<Storage, "getItem" | "setItem">;
    /** storage key (defaults to `tosijs:${path}`) */
    key?: string;
}
/**
 * Persist the value at a tosijs path: hydrate it from storage now (if a
 * stored value exists), then write it back (JSON, raw values) on change.
 * Writes are coalesced — tosijs fires the observer once per touched
 * sibling path per flush, but the subtree is serialized and written at
 * most once per microtask. Framework-free — works whether the path is
 * rendered by Angular, React, web components, or nothing at all. Returns
 * a stop function.
 *
 *   const stop = persist('app.todos')
 *
 * Durable state outlives code: if the shape of the persisted value
 * changes between releases, bump the key (or clear storage) — old-shape
 * values hydrate as-is.
 *
 * NOTE: duplicated from react-tosijs pending a shared framework-free
 * extras package (tracked in UPSTREAM.md).
 */
export declare const persist: (observed: XinTouchableType, options?: PersistOptions) => (() => void);
