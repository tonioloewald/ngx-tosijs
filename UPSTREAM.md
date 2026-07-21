# UPSTREAM

Workarounds in this repo for gaps in upstream projects (file, don't fix).

## tosijs

- **Rename shims** — `tosiPath ?? xinPath`, `tosiValue ?? xinValue` (tosijs ≥ 1.1 vs
  the ^1.0.6 peer floor). Retire when the floor moves to ≥ 1.1. Same shims as
  react-tosijs.
- **DOM globals required at import** — affects Angular Universal/SSR the same way it
  affects React SSR: tosijs can only load in DOM-shimmed pipelines.
  Issue: https://github.com/tonioloewald/tosijs/issues/18

## react-tosijs (sibling, not upstream proper)

- **Extras duplication** — `paths.ts` / `persist.ts` / `devtools.ts` are duplicated
  from react-tosijs, which recorded "a second consumer" as the trigger for graduating
  them to a shared framework-free package. That trigger has now fired.
  Issue: https://github.com/tonioloewald/react-tosijs/issues/3
  Until the shared package exists, bug fixes must land in both repos (first known
  divergence: 0.9.1's persist SecurityError guard is not yet in react-tosijs).

## @angular/core

- **Signal branding — RESOLVED, nothing to file.** As of 0.9.1 `tosiSignal` returns a
  real `signal()` with `set`/`update` patched to write through to tosijs (the observer
  keeps the pre-patch local setter), so `isSignal()` is true using only public API.

## bun

- **Selective barrel re-export bundler bug** — `export { a, b } from "./mod"` in
  `src/index.ts` made `Bun.build` (1.3.14) emit an undeclared renamed symbol
  (`_resolvePathOf2 is not declared`); `export *` avoids it. Not yet filed on
  oven-sh/bun: reproduce minimally and search existing reports before filing (the
  constraint is recorded in CLAUDE.md; react-tosijs's mock.module entry notes bun's
  other gotcha).

## tosijs-ui

- **`tjs-lang` workaround retired** — tosijs-ui 1.7.0 (installed here) fixed the
  build-time `tjs-lang/browser` resolution failure (tosijs-ui#20); the `tjs-lang`
  devDependency was dropped in 0.9.1 and the demo builds clean without it.
  react-tosijs (on 1.6.23) still carries its copy.
