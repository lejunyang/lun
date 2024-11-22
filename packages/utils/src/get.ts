import { OBJ } from "./_internal";

const check = (it: any) => it && it.Math === Math && /** return it */ it;
export const globalObject: typeof globalThis =
  check(typeof globalThis === OBJ && globalThis) ||
  check(typeof window === OBJ && window) ||
  check(typeof self === OBJ && self) ||
  // @ts-ignore
  check(typeof global === OBJ && global);
