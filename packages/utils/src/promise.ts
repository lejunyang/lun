export function withResolvers<T = void>(): {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
} {
  // @ts-ignore
  if (Promise.withResolvers) return Promise.withResolvers<T>();
  let resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // @ts-ignore
  return { promise, resolve, reject };
}
