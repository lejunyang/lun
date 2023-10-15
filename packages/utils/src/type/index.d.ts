export type Fn = () => void;
export type AnyFn = (...args: any[]) => any;

export type EnsureParameters<T> = T extends (...args: infer P) => any ? P : never[];
