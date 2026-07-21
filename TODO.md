# TODO

- [ ] **Extras duplication** — `paths.ts`, `persist.ts`, `devtools.ts` are copied from
  react-tosijs (the "second consumer" trigger react-tosijs's UPSTREAM.md recorded has
  now fired). Graduate them to a shared framework-free package (e.g. `tosijs-extras`),
  with both bridges re-exporting so the move is non-breaking. Until then, fix bugs in
  both repos.
- [ ] Run the nine-lens pre-release review before publishing to npm (0.9.0 is tagged
  and deployed but not yet published — publish gate: review → GO → `npm publish`).
- [ ] Angular version matrix: the suite runs against Angular 22 only; the peer range
  claims >=16. Spot-check 16 (signals/DestroyRef arrival) the way react-tosijs verified
  tosijs 1.0.6.
- [ ] `TosiSignal` lacks the `SIGNAL` brand (`isSignal()` false). Investigate whether
  Angular's public API allows branding a custom signal wrapper; document the limitation
  meanwhile (README does).
- [ ] A `[(tosiPath)]`-style directive for form controls (banana-in-a-box ergonomics)
  for template-driven-forms users.
- [ ] CI workflow (install, build, test, typecheck) — same gap as react-tosijs.
- [ ] Add a cross-link on react.tosijs.net's demo doc to angular.tosijs.net
  ("both frameworks, one state") — one line in react-xinjs/demo/static/use-tosi.md.
- [ ] tosijs-ui 1.7.0 is installed here (fixed tjs-lang resolution — tosijs-ui#20);
  `tjs-lang` devDep may now be droppable. Verify the demo build without it, then remove.
  react-tosijs (on 1.6.23) still needs its copy.
