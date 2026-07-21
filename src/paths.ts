import { tosiSignal, TosiSignal, TosiSignalOptions } from "./tosi-signal";

/**
 * Template-literal typing for tosijs paths. A path is serializable,
 * loggable, and framework-free — these types add the one thing selector
 * closures had over them: compile-time checking.
 *
 * NOTE: duplicated from react-tosijs pending a shared framework-free
 * extras package (tracked in UPSTREAM.md).
 */

type Scalar = string | number | boolean | null | undefined | ((...args: any[]) => any);

// tosijs keyed lookups accept any key property, not just id
type ArrayIndex = `[${number}]` | `[${string}=${string}]`;

type SubPath<T> = T extends Scalar
  ? never
  : T extends Array<any>
    ? never
    : {
        [K in keyof T & string]: T[K] extends Scalar
          ? K
          : T[K] extends Array<infer E>
            ?
                | K
                | `${K}${ArrayIndex}`
                | (E extends Scalar ? never : `${K}${ArrayIndex}.${SubPath<E>}`)
            : K | `${K}.${SubPath<T[K]>}`;
      }[keyof T & string];

/** All valid observation paths into a state shape S */
export type TosiPath<S> = SubPath<S>;

type ElementOf<A> = A extends Array<infer E> ? E : never;

/**
 * The value type at path P within state shape S. Indexed/keyed lookups
 * yield `E | undefined` — an index can be out of range and a key can
 * miss — so pair them with an initialValue or handle undefined.
 */
export type TosiPathValue<T, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? TosiPathValue<NonNullable<TosiPathValue<T, Head>>, Rest>
  : P extends `${infer K}[${string}]`
    ? ElementOf<TosiPathValue<T, K>> | undefined
    : P extends keyof T
      ? T[P]
      : never;

/**
 * A typed facade over tosiSignal for a known state shape:
 *
 *   type AppState = { app: { count: number, todos: { id: string, text: string }[] } }
 *   const { tosiSignal } = typedTosi<AppState>()
 *   const text = tosiSignal('app.todos[0].text')  // TosiSignal<string | undefined>
 */
export const typedTosi = <S extends object>() => ({
  tosiSignal: <P extends TosiPath<S> & string>(
    path: P,
    options?: TosiSignalOptions<TosiPathValue<S, P>>,
  ): TosiSignal<TosiPathValue<S, P>> =>
    tosiSignal<TosiPathValue<S, P>>(path, options),
});
