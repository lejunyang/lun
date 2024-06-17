export type Fn = () => void;
export type AnyFn<R = any> = (...args: any[]) => R;
export type CommonObject = Record<string | number | symbol, unknown>;
export type AnyObject = Record<string | number | symbol, any>;
export type Constructor<T = any> = new (...args: any[]) => T;

export type EnsureParameters<T, F = never> = T extends (...args: infer P) => any ? P : F;

export type UnwrapPrimitive<T> = T extends String
  ? string
  : T extends Number
  ? number
  : T extends Boolean
  ? boolean
  : T extends BigInt
  ? bigint
  : T extends Symbol
  ? symbol
  : T extends Array<infer A> // Array and Function need to be placed before Object
  ? A[]
  : T extends Function
  ? AnyFn
  : T extends Object
  ? object
  : T;

export type ExcludeNumberAndSymbol<T> = T extends number | symbol ? never : T;

export type TryGet<O, K, D = never> = K extends keyof O ? O[K] : D;

export type RemoveFirstParam<F> = F extends (a: any, ...args: infer P) => infer R ? (...args: P) => R : F;
