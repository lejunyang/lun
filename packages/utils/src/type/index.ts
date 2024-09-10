export type Fn = () => void;
export type AnyFn<R = any> = (...args: any[]) => R;
export type AnyAsyncFn<R = any> = (...args: any[]) => Promise<R>;
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
  : T extends Array<infer A>
  ? A[]
  : T;

export type ExcludeNumberAndSymbol<T> = T extends number | symbol ? never : T;

export type TryGet<O, K, D = never> = K extends keyof O ? O[K] : D;

export type RemoveFirstParam<F> = F extends (a: any, ...args: infer P) => infer R ? (...args: P) => R : F;

export type DeepPartial<T extends object> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type DeepRequired<T extends object> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K];
};

export type DeepReadonly<T extends object> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

export type DeepWritable<T extends object> = {
  -readonly [K in keyof T]: T[K] extends object ? DeepWritable<T[K]> : T[K];
};

export type DeepNonNullable<T> = T extends object
  ? {
      [K in keyof T]: DeepNonNullable<T[K]>;
    }
  : NonNullable<T>;

export type GetRequiredKeys<T extends object> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

export type GetOptionalKeys<T extends object> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];