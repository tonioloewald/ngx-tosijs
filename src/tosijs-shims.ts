import * as tosijs from "tosijs";

// tosiPath/tosiValue arrived in tosijs 1.1 (renamed from xinPath/xinValue);
// the shims keep the wide ^1.0.6 peer range honest. Exported for tests.

export const _resolvePathOf = (t: {
  tosiPath?: (x: any) => string | undefined;
  xinPath?: (x: any) => string | undefined;
}): ((x: any) => string | undefined) => {
  const fn = t.tosiPath ?? t.xinPath;
  if (fn === undefined) {
    throw new Error(
      "ngx-tosijs requires tosijs ^1.0.6 (found neither tosiPath nor xinPath export)",
    );
  }
  return fn;
};

export const _resolveValueOf = (t: {
  tosiValue?: (x: any) => any;
  xinValue?: (x: any) => any;
}): ((x: any) => any) => {
  const fn = t.tosiValue ?? t.xinValue;
  if (fn === undefined) {
    throw new Error(
      "ngx-tosijs requires tosijs ^1.0.6 (found neither tosiValue nor xinValue export)",
    );
  }
  return fn;
};

export const pathOf = _resolvePathOf(tosijs as any);
export const valueOf = _resolveValueOf(tosijs as any);
