# TODO

- [ ] **Extras duplication** — `paths.ts`, `persist.ts`, `devtools.ts` are copied from
  react-tosijs (the "second consumer" trigger react-tosijs's UPSTREAM.md recorded has
  now fired; the 0.9.0 review flagged that no tracking issue exists — filing one on
  react-tosijs is still pending). Graduate them to a shared framework-free package
  (e.g. `tosijs-extras`),
  with both bridges re-exporting so the move is non-breaking. (`dev.ts` is NOT in scope —
  per the maintainer it's the primitive that evolved into the tosijs-ui build system;
  the convergence path for the bridges is adopting that, not sharing dev.ts.) Until then, fix
  bugs in both repos — and consider a mechanical drift-check (diff the logic-bearing
  lines against the react-tosijs copies in a test or prepublish step).
- [x] ~~Run the nine-lens review before publishing~~ — inverted for 0.9.0 (published
  first); the review ran post-publish, found a blocker (stale `update()`), fixed in
  0.9.1. Lesson filed to practices (gate sits before the tag push).

## Unverified leads from the 0.9.0 review (sanity-check before acting)

- [x] ~~Read-after-write gap~~ — **done in 0.9.1** (`set()` syncs the local signal).
- [ ] Possible observer leak pattern when tosiSignal is created outside any injection
  context repeatedly with `manualCleanup` forgotten — audit/document.
- [x] ~~persist SecurityError on localStorage access~~ — **done in 0.9.1**.
- [ ] Typed-path parsing edge cases (keys containing dots/brackets) — audit
  `TosiPathValue` splitting.
- [ ] persist: optional `debounce?: number` (with pagehide flush) for hot-path state;
  devtools: coalesce snapshots per microtask or snapshot only the fired root.
- [ ] Dedup path-or-proxy resolution between tosi-signal.ts and persist.ts into
  `tosijs-shims.ts` (unless the extras package lands first).
- [ ] Demo bundle is ~3MB because @angular/compiler (JIT) is bundled — note on the
  demo page that this is demo overhead, not library overhead; AOT if ever practical
  without the CLI.
- [ ] Angular version matrix: the suite runs against Angular 22 only; the peer range
  claims >=16. Spot-check 16 (signals/DestroyRef arrival) the way react-tosijs verified
  tosijs 1.0.6.
- [x] ~~`TosiSignal` lacks the `SIGNAL` brand~~ — **done in 0.9.1**: returns a real
  `signal()` with writes redirected; `isSignal()` is true.
- [ ] A `[(tosiPath)]`-style directive for form controls (banana-in-a-box ergonomics)
  for template-driven-forms users.
- [ ] CI workflow (install, build, test, typecheck) — same gap as react-tosijs.
- [ ] Add a cross-link on react.tosijs.net's demo doc to angular.tosijs.net
  ("both frameworks, one state") — one line in react-xinjs/demo/static/use-tosi.md.
- [x] ~~Drop `tjs-lang` devDep~~ — **done in 0.9.1** (tosijs-ui 1.7.0 fixed
  resolution; demo builds clean without it). react-tosijs (on 1.6.23) still needs its
  copy.
