# Changelog

## 0.9.0 (2026-07-21)

Initial release.

- **`tosiSignal(pathOrProxy, options?)`** — a writable Angular signal bound to a tosijs
  path: template/`computed()`/`effect()` tracking, `.set()`/`.update()` writing through
  to shared state, automatic `DestroyRef` cleanup (or `{injector}` / `{manualCleanup}`).
  Objects and functions always propagate on touch; primitive no-op touches are deduped.
- **`provideTosi()`** — Zone.js bridge for legacy apps reading proxies directly in
  templates: out-of-zone mutations trigger change detection, coalesced to one zone
  entry per flush.
- **Framework-free extras** (shared with react-tosijs, duplicated pending a common
  package): `typedTosi<AppState>()` compile-time-checked paths, `persist()` (coalesced
  storage sync), `connectDevTools()` (Redux DevTools tap).
- **Compatibility**: Angular >=16 <23 peer range; tosijs ^1.0.6 via `tosiPath ?? xinPath`
  / `tosiValue ?? xinValue` shims; zoneless-first, zone-compatible.
- **Demo** ([angular.tosijs.net](https://angular.tosijs.net)): the same Reminders app in
  Angular (zoneless signals, JIT, no CLI) and React (react-tosijs) side by side, bound
  to the same tosijs state — plus tosijs-ui web components hosted natively in the
  Angular template, and a console-driveable shared state model.
- 22 tests + type-level tests + typecheck/test/build publish gate.
