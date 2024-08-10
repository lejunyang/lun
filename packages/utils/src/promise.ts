import { AnyFn } from './type';

function* generator(this: any) {
  yield this.promise;
  yield this.resolve;
  yield this.reject;
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
  // @ts-ignore
  if (Promise.withResolvers) return { ...Promise.withResolvers<T>(), [Symbol.iterator]: generator };
  let resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    // @ts-ignore
    resolve,
    // @ts-ignore
    reject,
    [Symbol.iterator]: generator,
  } as any;
}

/**
 * Polyfill for Promise.try
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try
 */
export function promiseTry<F extends AnyFn>(fn: F): Promise<Awaited<ReturnType<F>>> {
  // @ts-ignore
  if (Promise.try) return Promise.try(fn);
  else return new Promise((resolve) => resolve(fn()));
}
