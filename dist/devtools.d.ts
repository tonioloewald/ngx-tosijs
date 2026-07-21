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
export declare const connectDevTools: ({ name, roots, }: DevToolsOptions) => (() => void);
