# ngx-tosijs

[github](https://github.com/tonioloewald/ngx-tosijs#readme) | [npm](https://www.npmjs.com/package/ngx-tosijs) | [tosijs](https://tosijs.net) | [react-tosijs](https://react.tosijs.net) | [discord](https://discord.gg/ramJ9rgky5)

**Insanely simple state management for Angular — and an off-ramp from Angular. Take your pick.**

> Dedicated to my fellow ex-Googlers, to the Googlers still in the building, and to
> everyone anywhere who knows — or has known — the particular frustration of managing
> state in Angular apps. I was one of you (I worked on next-generation tooling at
> Google), and this is the escape hatch I wished for. — Tonio

If you just want the state management: `tosiSignal` gives you a writable Angular signal
bound to a path — no zones, no NgZone.run, no RxJS plumbing, no NgRx boilerplate, and
you can talk to state from outside the Angular tree (try it in the console below). If
you want the off-ramp (one that otherwise basically doesn't exist): your state and logic
live in [tosijs](https://tosijs.net) — plain observable objects with no framework
attached — and Angular becomes just one way of viewing them. Replace Angular views with
web components bound to the same state as fast or as slowly as makes sense, and when the
last Angular view goes, delete Angular. No sync layer, no big-bang rewrite.

## Look up — two frameworks, one state

The two Reminders apps above are **the same app in two frameworks**: one is Angular
(signals, zoneless), the other is React (`react-tosijs`), and they are bound to the
same tosijs paths. Type in either one — the other follows instantly. Neither framework
knows the other exists; tosijs is the only thing they share. That's what an off-ramp
looks like mid-journey: old views and new views coexisting on live state, no
migration cliff.

The mascot above and the document you are reading are web components
([tosijs-ui](https://ui.tosijs.net)) hosted directly in the Angular template —
Angular hosts custom elements natively (`CUSTOM_ELEMENTS_SCHEMA`), no wrappers needed.

## `tosiSignal()`

`tosiSignal(path)` returns a writable signal: read it in templates, `computed()`, or
`effect()` like any signal; call `.set()` / `.update()` to write through to the shared
state. Mutations from anywhere — other components, other frameworks, vanilla JS, a
timer, the console — propagate back in.

Open your browser's console and try:

```
app.name = "hello tosijs"
```

Both apps' titles change — Angular *and* React. Or create todo items directly:

```
app.todos.push({
  id: Math.random(),
  reminder: 'try building an app with tosijs'
})
```

You can even modify the text of an item in place:

```
// assuming there is a reminder to modify
app.todos[0].reminder = 'look I changed ya'
```

No NgZone, no markForCheck, no async pipe, no store dispatch. The state doesn't know
Angular exists — which is precisely why everything works from everywhere.

## Zone.js apps

Zoneless + signals is the happy path, but legacy Zone.js apps are covered too: add
`provideTosi()` to your bootstrap providers and mutations from outside the zone
trigger change detection (coalesced to one zone entry per tosijs flush). Templates
can then read tosijs proxies directly and dirty checking does the rest.

## The extras

Framework-free, exactly as in [react-tosijs](https://react.tosijs.net):
`typedTosi<AppState>()` (compile-time-checked paths), `persist()` (storage sync,
coalesced writes), and `connectDevTools()` (Redux DevTools tap). See the
[README](https://github.com/tonioloewald/ngx-tosijs#readme).

`ngx-tosijs` is copyright ©2026 Tonio Loewald
