import { AnyFn } from './type';

function process<T>(obj: ReturnType<typeof Promise.withResolvers>) {
  return Object.assign([obj.promise, obj.resolve, obj.reject], obj) as {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
  } & [Promise<T>, (value: T | PromiseLike<T>) => void, (reason?: any) => void];
}
/**
 * Polyfill for Promise.withResolvers, returns an object with: promise, resolve, and reject. For convenience, the returned object is also an iterable containing the promise, resolve, and reject functions.
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers
 */
export function withResolvers<T = void>(): {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
} & [Promise<T>, (value: T | PromiseLike<T>) => void, (reason?: any) => void] {
  if (Promise.withResolvers) return process<T>(Promise.withResolvers());
  let resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return process({
    promise,
    // @ts-ignore
    resolve,
    // @ts-ignore
    reject,
  });
}

/**
 * Polyfill for Promise.try
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try
 */
export function promiseTry<F extends AnyFn>(fn: F, ...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> {
  // @ts-ignore
  if (Promise.try) return Promise.try(fn, ...args);
  else return new Promise((resolve) => resolve(fn(...args)));
}
