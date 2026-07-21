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
  them to a shared framework-free package. That trigger has now fired — see TODO.md.
  Until the shared package exists, bug fixes must land in both repos.

## @angular/core

- **No public seam for branding custom signal wrappers** — `TosiSignal` wraps an
  internal `signal()`; `isSignal()` returns false for it because the `SIGNAL` symbol
  isn't exported as public API. Tracking works regardless (reads delegate to the inner
  signal). Not filed: verify against current Angular internals/docs before asking —
  there may be a supported pattern (tracked in TODO.md).
