# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Shared practices

Read `AGENTS.md` first. It links the shared engineering practices for all tosijs projects.
This repo is the **sibling of react-tosijs** (`../react-xinjs` — folder kept its pre-rename
name) and deliberately mirrors its structure, tooling, and conventions; when in doubt,
check how react-tosijs does it.

## What this is

`ngx-tosijs` — the Angular bridge for tosijs state management, published as ESM with
`@angular/core` (>=16 <23) and `tosijs` (^1.0.6) as peer dependencies. Positioning (the
maintainer's phrasing): **"insanely simple state management for Angular — and an off-ramp
from Angular. Take your pick."**

Public API, all re-exported by `src/index.ts`:

- `src/tosi-signal.ts` — `tosiSignal(pathOrProxy, options?)`: a writable-signal-shaped
  binding to a tosijs path. Wraps an internal `signal()` whose custom `equal` always
  propagates objects/functions (in-place mutation preserves identity) and dedupes
  primitive no-op touches via `Object.is`. Cleanup via `DestroyRef` (injection context
  or `{injector}`), or `{manualCleanup: true}` + `.destroy()`. `isSignal()` is false for
  it (hand-rolled wrapper; tracking works because reading it reads the inner signal).
- `src/provide-tosi.ts` — `provideTosi()`: Zone.js bridge (APP_INITIALIZER multi, for
  >=16 compatibility) that coalesces tosijs flushes into one `zone.run(noop)` per
  microtask so out-of-zone mutations trigger dirty checking. Unneeded when zoneless.
- `src/paths.ts`, `src/persist.ts`, `src/devtools.ts` — **duplicated from react-tosijs**
  pending a shared framework-free extras package (see UPSTREAM.md). Fix bugs in BOTH
  repos until then.
- `src/tosijs-shims.ts` — `tosiPath ?? xinPath` and `tosiValue ?? xinValue` resolution
  (keeps the ^1.0.6 peer honest; throws a clear version error if neither exists).

## Commands

- `bun start` (runs `bun dev.ts`) — build + watch + serve the demo at http://localhost:8017.
- `bun run build` (runs `bun dev.ts --build`) — one-shot build, then exits.
- `bun test` — bun test runner; happy-dom preloaded via `bunfig.toml` (tosijs needs DOM
  globals at import). Angular's `signal()` works standalone, so tests don't need TestBed:
  `{manualCleanup: true}` or a fake injector (`makeFakeInjector` in the test file).
- `bun run typecheck` — `tsc --noEmit` over src + demo + tests; type-level tests live in
  `tests/*.typecheck.ts` (compiled, never executed).
- `npm publish` runs `prepublishOnly` (tests + typecheck + build) automatically.

## Build system (dev.ts)

Same hand-rolled Bun pipeline as react-tosijs, same rules:

- **Generated, do not hand-edit:** `dist/`, `docs/` (wiped and regenerated per demo
  change), `src/version.ts` (rewritten from package.json version).
- Demo sources in `demo/src/` (built to `docs/`); static assets in `demo/static/`
  (copied to `docs/`; `*.amdc` design sources excluded). Edit `demo/`, never `docs/`.
- Library build: `src/index.ts` → `dist/` ESM, `tosijs` and `@angular/core` external.
  NOTE: `index.ts` uses `export *` per module — a selective
  `export { a, b } from "./mod"` re-export triggered a Bun bundler bug (emitted an
  undeclared renamed symbol).
- **The demo compiles Angular with JIT, no CLI**: `import "@angular/compiler"` first in
  `main.ts`, standalone components with inline templates, `bootstrapApplication` +
  `provideZonelessChangeDetection()`. tsconfig needs `experimentalDecorators: true` and
  `useDefineForClassFields: false`. No zone.js anywhere.
- The demo mounts a **React island** (`react-island.tsx`, via react-tosijs) bound to the
  same state paths as the Angular app — the two-frameworks-one-state demo is the
  centerpiece; don't break it.
- **After upgrading tosijs or tosijs-ui, load the demo in a real browser** — undefined
  custom elements fail silently (see react-tosijs CLAUDE.md; tags are `tosi-*` since
  tosijs-ui 1.6).

## Deployment

`docs/` is served by GitHub Pages as **angular.tosijs.net** (CNAME in `demo/static/`).
Pushing to main deploys; CDN cache adds ~10 minutes.
