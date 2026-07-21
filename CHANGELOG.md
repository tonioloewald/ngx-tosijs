# Changelog

## 0.9.1 (2026-07-21)

### Fixed

- **`tosiSignal.update()` no longer loses same-tick writes** (0.9.0 blocker, caught by
  the post-publish review): it computed from the wrapped signal, which only refreshes
  on the async tosijs flush — so `count.update(c => c+1); count.update(c => c+1)` in
  one tick yielded 1, and an update after a same-tick `set()` or external mutation
  clobbered it. `update` now computes from live state. **0.9.0 is deprecated on npm** —
  upgrade.
- Regression tests for same-tick write composition (no `await updates()` between
  writes — the pattern that masked the bug).

### Changed

- **A `TosiSignal` is now a real Angular signal** — `tosiSignal` returns an actual
  `signal()` with `set`/`update` redirected to write through to tosijs, so
  `isSignal()` is true (0.9.0 returned a wrapper for which it was false).
- Dropped the `tjs-lang` devDependency (tosijs-ui 1.7.0 fixed the bundling issue —
  tosijs-ui#20); demo bundle rebuilt, mascot z-ordering fixed to match
  react.tosijs.net.
- `CHANGELOG.md` now ships in the npm package.

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
