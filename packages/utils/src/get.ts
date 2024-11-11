const check = (it: any) => it && it.Math === Math && /** return it */ it;
export const globalObject: typeof globalThis =
  check(typeof globalThis === 'object' && globalThis) ||
  check(typeof window === 'object' && window) ||
  check(typeof self === 'object' && self) ||
  // @ts-ignore
  check(typeof global === 'object' && global);
