import { AnyFn } from './type';

/**
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers
 */
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

/**
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try
 */
export function promiseTry<F extends AnyFn>(fn: F): Promise<Awaited<ReturnType<F>>> {
  // @ts-ignore
  if (Promise.try) return Promise.try(fn);
  else return new Promise((resolve) => resolve(fn()));
}