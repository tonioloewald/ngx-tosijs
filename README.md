# ngx-tosijs

[github](https://github.com/tonioloewald/ngx-tosijs#readme) | [npm](https://www.npmjs.com/package/ngx-tosijs) | [live demo](https://angular.tosijs.net) | [tosijs](https://tosijs.net) | [react-tosijs](https://react.tosijs.net) | [discord](https://discord.gg/ramJ9rgky5)

**Insanely simple state management for Angular — and an off-ramp from Angular. Take your pick.**

If you just want the state management: `tosiSignal` gives you a writable Angular signal
bound to a path — no zones, no `NgZone.run`, no RxJS plumbing, no NgRx boilerplate —
and you can talk to state from outside the Angular tree: a timer, a socket handler, the
browser console, code that's never heard of Angular. If you want the off-ramp (one that
otherwise basically doesn't exist): your state and logic live in
[tosijs](https://tosijs.net) — plain observable objects with no framework attached —
and Angular becomes just one way of viewing them. Build new functionality on a vastly
superior state management system, and migrate away from Angular as fast or as slowly
as makes sense.

**See it live**: [angular.tosijs.net](https://angular.tosijs.net) runs the same
Reminders app in Angular (zoneless signals) *and* React
([react-tosijs](https://react.tosijs.net)) side by side, bound to the same state.
Neither framework knows the other exists.

## The off-ramp, step by step

1. **Move state and logic out of components** into a tosijs proxy. This works inside
   your existing Angular app — any version ≥ 16, zoned or zoneless, no rewrite.
2. **Components become thin views** via `tosiSignal`. Stores, dispatch, effects-classes,
   and `async` pipe plumbing simply stop being necessary.
3. **Build new UI as web components** ([tosijs-ui](https://ui.tosijs.net), or your own
   via tosijs `Component`), hosted directly in Angular templates
   (`CUSTOM_ELEMENTS_SCHEMA` — Angular hosts custom elements natively, no wrappers).
   They bind to the same paths as your Angular views — both stay in sync automatically,
   because neither owns the state.
4. **Replace remaining Angular views at your own pace.** When the last one goes, delete
   `@angular/*` from package.json. Your state, logic, and new components are untouched —
   they never depended on Angular in the first place.

There is no step where you maintain two sources of truth, write a sync layer, or do a
big-bang rewrite. (And if your escape route passes through React territory — or vice
versa — [react-tosijs](https://react.tosijs.net) binds the same state from React.)

## tosiSignal in two minutes

```ts
import { Component } from '@angular/core'
import { xinProxy } from 'tosijs'
import { tosiSignal } from 'ngx-tosijs'

const { clock } = xinProxy({
  clock: { time: new Date().toLocaleTimeString() },
})

setInterval(() => {
  clock.time = new Date().toLocaleTimeString()
}, 1000)

@Component({
  selector: 'app-clock',
  standalone: true,
  template: `<div>{{ time() }}</div>`,
})
export class ClockComponent {
  time = tosiSignal<string>('clock.time')
}
```

The interval updates state *outside* Angular — no zone, no `markForCheck`, no
`ChangeDetectorRef` — and the view follows, because `tosiSignal` is a real Angular
signal: read it in templates, `computed()`, or `effect()`; call `.set()` / `.update()`
to write through to the shared state. Cleanup is automatic via `DestroyRef` (create it
in a component/service, or pass `{ injector }`, or `{ manualCleanup: true }` and call
`.destroy()` yourself).

Works zoneless (recommended — signals notify Angular's scheduler directly) and in
Zone.js apps alike.

## Zone.js apps: provideTosi()

For zoned apps that read tosijs proxies *directly* in templates (dirty checking
re-reads them every pass), `provideTosi()` bridges tosijs flushes into the zone so
mutations from outside Angular trigger change detection — coalesced to one zone entry
per flush:

```ts
bootstrapApplication(AppComponent, {
  providers: [provideTosi()],
})
```

Unnecessary (and harmless) in zoneless apps using `tosiSignal`.

## Typed paths

```ts
import { typedTosi } from 'ngx-tosijs'

type AppState = {
  app: { count: number; todos: { id: string; text: string }[] }
}

const { tosiSignal } = typedTosi<AppState>()

const text = tosiSignal('app.todos[0].text') // TosiSignal<string | undefined>
const oops = tosiSignal('app.cuont')         // compile error
```

`TosiPath<S>` and `TosiPathValue<S, P>` are exported for building your own typed helpers.

## Persistence & DevTools

Framework-free, identical to react-tosijs:

```ts
import { persist, connectDevTools } from 'ngx-tosijs'

const stop = persist('app.todos')                    // localStorage sync, coalesced writes
const disconnect = connectDevTools({ roots: ['app'] }) // Redux DevTools tap
```

Durable state outlives code: if the shape of a persisted value changes between
releases, bump the `key`.

## Compatibility

- **Angular** `>=16 <23` (signals + `DestroyRef` arrived in 16; the demo runs
  Angular 22, zoneless, JIT-compiled without the CLI).
- **tosijs** `^1.0.6` — the library uses `tosiPath`/`tosiValue` when available
  (tosijs ≥ 1.1) and falls back to `xinPath`/`xinValue` on older versions.
- `isSignal()` returns `false` for a `TosiSignal` (it wraps an internal signal);
  template/`computed()`/`effect()` tracking works normally.
- **SSR**: tosijs needs DOM globals to load, so server rendering means a DOM-shimmed
  pipeline (see [tosijs#18](https://github.com/tonioloewald/tosijs/issues/18)).

## Development

- `bun start` — build, watch, and serve the demo at http://localhost:8017
- `bun run build` — one-shot build of `dist/` (library) and `docs/` (demo site)
- `bun test` — run the test suite
- `bun run typecheck` — compile-only type tests
