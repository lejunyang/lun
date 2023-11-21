export type Fn = () => void;
export type AnyFn<R = any> = (...args: any[]) => R;
export type CommonObject = Record<string | number | symbol, unknown>;
export type AnyObject = Record<string | number | symbol, any>;

export type EnsureParameters<T> = T extends (...args: infer P) => any ? P : never[];
