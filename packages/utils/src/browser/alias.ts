// freeze but don't add readonly type, it's for component's instance element. if's readonly, ts will report error if we modify the props
export const freeze = <T>(o: T) => Object.freeze(o) as T;

export const identity = <T>(x: T) => x;

export const getRect = (elOrRange: Element | Range | { getBoundingClientRect(): DOMRect }) =>
  elOrRange.getBoundingClientRect();
