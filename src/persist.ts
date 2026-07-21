import * as tosijs from "tosijs";
import type { XinTouchableType } from "tosijs";
import { pathOf, valueOf } from "./tosijs-shims";

const { xin, observe, unobserve } = tosijs;

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
export const persist = (
  observed: XinTouchableType,
  options: PersistOptions = {},
): (() => void) => {
  const path = typeof observed === "string" ? observed : pathOf(observed);
  if (typeof path !== "string") {
    throw new Error("persist must be passed a path or a tosijs proxy");
  }
  let storage = options.storage;
  if (storage === undefined) {
    try {
      // merely touching localStorage throws SecurityError in some
      // embedding contexts (sandboxed iframes, blocked third-party)
      storage = (globalThis as any).localStorage;
    } catch (error) {
      storage = undefined;
    }
  }
  if (storage === undefined) {
    throw new Error(
      `persist: no storage available for ${path} — pass options.storage in non-browser or sandboxed environments`,
    );
  }
  const key = options.key ?? `tosijs:${path}`;

  const stored = storage.getItem(key);
  if (stored !== null) {
    try {
      xin[path] = JSON.parse(stored);
    } catch (error) {
      console.error(`persist: ignoring unparseable stored value for ${key}`, error);
    }
  }

  let writeQueued = false;
  let stopped = false;
  const write = () => {
    writeQueued = false;
    if (stopped) return;
    try {
      const json = JSON.stringify(valueOf(xin[path]));
      // JSON.stringify(undefined) is undefined, which setItem would
      // coerce to the poisonous string "undefined"
      storage.setItem(key, json === undefined ? "null" : json);
    } catch (error) {
      console.error(`persist: could not store value for ${key}`, error);
    }
  };
  const listener = observe(path, () => {
    if (!writeQueued) {
      writeQueued = true;
      queueMicrotask(write);
    }
  });
  return () => {
    stopped = true;
    unobserve(listener);
  };
};
