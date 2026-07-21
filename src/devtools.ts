import * as tosijs from "tosijs";
import { valueOf } from "./tosijs-shims";

const { xin, observe, unobserve } = tosijs;

export interface DevToolsOptions {
  /** instance name shown in the Redux DevTools UI */
  name?: string;
  /** which xin roots to snapshot after each change, e.g. ['app'] */
  roots: string[];
}

/**
 * Stream tosijs path touches to the Redux DevTools browser extension:
 * each touched path becomes an action (the path string is the action
 * type) with a raw-value snapshot of the given roots as the state. A
 * debugging tap, not a time-travel store — tosijs state is mutated in
 * place, so jumping to a past state in the extension inspects it without
 * restoring it. No-op (returns a disconnect that does nothing) when the
 * extension isn't present. Returns a disconnect function.
 *
 *   const disconnect = connectDevTools({ roots: ['app'] })
 *
 * NOTE: duplicated from react-tosijs pending a shared framework-free
 * extras package (tracked in UPSTREAM.md).
 */
export const connectDevTools = ({
  name = "tosijs",
  roots,
}: DevToolsOptions): (() => void) => {
  const extension = (globalThis as any).__REDUX_DEVTOOLS_EXTENSION__;
  if (!extension) {
    return () => {};
  }
  const connection = extension.connect({ name });
  const snapshot = () =>
    Object.fromEntries(roots.map((root) => [root, valueOf(xin[root])]));
  connection.init(snapshot());
  // one tosijs observer per root — tosijs's own path matching covers
  // subpath touches and ancestor replacement, no hand-rolled filter
  const listeners = roots.map((root) =>
    observe(root, (path: string) => {
      connection.send({ type: path }, snapshot());
    }),
  );
  return () => {
    for (const listener of listeners) {
      unobserve(listener);
    }
    connection.unsubscribe?.();
  };
};
