import { inBrowser } from './browser';
import { noop } from './function';
import { ensureNumber } from './number';
import { withResolvers } from './promise';

// lodash

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  _wait?: number | string,
  options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number | string;
    onSchedulingUpdate?: (isScheduling: boolean) => void;
  },
) {
  let timerId: ReturnType<typeof setTimeout> | undefined,
    /** last time when debounced func called */ lastCallTime: number,
    /** last time when original func invoked */ lastInvokeTime: number = 0;
  let lastArgs: IArguments | undefined, lastThis: ThisType<T> | undefined, result: ReturnType<T> | undefined;
  let { leading, trailing = true, maxWait: _maxWait, onSchedulingUpdate } = options || {};
  onSchedulingUpdate ||= noop;
  const wait = ensureNumber(_wait, 0);
  const maxWait = _maxWait !== undefined ? Math.max(ensureNumber(_maxWait, 0), wait) : null;

  function invokeFunc(time: number) {
    const args = lastArgs,
      thisArg = lastThis;
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args as any);
    return result;
  }

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - lastCallTime,
      timeSinceLastInvoke = time - lastInvokeTime;
    return (
      lastCallTime === undefined || // first call
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 || // it happens only when manually modify system time
      (maxWait !== null && timeSinceLastInvoke >= maxWait)
    );
  };

  /**
   * Reset `maxWait` timer's invoke time by setting `lastInvokeTime`.
   * Set timer for trailing edge.
   * Invoke the func if leading is true and return the result.
   */
  function leadingEdge(time: number) {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    onSchedulingUpdate!(true);
    return leading ? invokeFunc(time) : result;
  }

  /**
   * clear timeId\
   * invoke the func if trailing is true and lastArgs is defined\
   * clear lastArgs and lastThis(lastArgs is defined only when debounced is called. set lastArgs to undefined, so that if any timerExpired triggers trailingEdge)
   */
  function trailingEdge(time: number) {
    timerId = undefined;
    onSchedulingUpdate!(false);
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    const timeSinceLastCall = time - lastCallTime,
      timeSinceLastInvoke = time - lastInvokeTime,
      timeWaiting = wait - timeSinceLastCall;
    const remainingWait = maxWait !== null ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
    timerId = setTimeout(timerExpired, remainingWait); // Restart the `timerExpired` timer
    onSchedulingUpdate!(true);
  }

  const debounced = function (this: ThisType<T>) {
    const time = Date.now();
    const shouldInvokeNow = shouldInvoke(time);
    lastCallTime = time;
    lastArgs = arguments;
    lastThis = this;
    if (shouldInvokeNow) {
      // if no timer, start leading edge
      if (timerId === undefined) return leadingEdge(lastCallTime);
      // if time is defined and set maxWait, invoke
      if (maxWait !== null) {
        timerId = setTimeout(timerExpired, wait);
        onSchedulingUpdate!(true);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
      onSchedulingUpdate!(true);
    }
    return result;
  } as T & { flush: () => ReturnType<T>; cancel: () => void; isScheduling: () => boolean };

  const isScheduling = () => timerId !== undefined;
  Object.assign(debounced, {
    flush() {
      return !isScheduling() ? result : trailingEdge(Date.now());
    },
    cancel() {
      if (isScheduling()) clearTimeout(timerId);
      lastInvokeTime = 0;
      lastCallTime = (lastArgs = lastThis = timerId = undefined) as any;
      onSchedulingUpdate!(false);
    },
    isScheduling,
  });

  return debounced;
}

export const throttle = function <T extends (...args: any[]) => any>(
  func: T,
  wait?: number | string,
  options?: {
    leading?: boolean;
    trailing?: boolean;
    onSchedulingUpdate?: (isScheduling: boolean) => void;
  },
) {
  return debounce(func, wait, {
    ...options,
    maxWait: wait,
    leading: options?.leading === undefined ? true : options?.leading,
  });
};

export function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Schedule a function to be called in a number of animation frames
 * @param callback The function to be called.
 * @param frames The number of frames to wait before executing the callback. Default is 1.
 * @param shouldCancel Optional function to determine if the scheduled callback should be cancelled.
 * @returns A function to cancel the scheduled animation frame.
 */
export function raf(callback: FrameRequestCallback, frames = 1, shouldCancel?: () => boolean) {
  return internalRaf(callback, frames, inBrowser ? (document.timeline?.currentTime as number) || 0 : 0, shouldCancel);
}

/** wait specified animation frames */
export function waitFrames(frames = 1) {
  const [promise, resolve] = withResolvers<number>();
  raf(resolve, frames);
  return promise;
}

function internalRaf(
  callback: FrameRequestCallback,
  frames = 1,
  time: DOMHighResTimeStamp,
  shouldCancel?: () => boolean,
) {
  let localCanceled = false;
  shouldCancel ||= () => localCanceled;
  if (!frames || frames < 0) {
    !shouldCancel() && callback(time);
    return noop;
  }
  const id = requestAnimationFrame((t) => {
    if (shouldCancel!()) return;
    internalRaf(callback, frames - 1, t, shouldCancel);
  });
  return () => {
    localCanceled = true;
    cancelAnimationFrame(id);
  };
}

export function rafThrottle<T extends (...args: any[]) => any>(callback: T, frames = 1, shouldCancel?: () => boolean) {
  let queuedCallback: T | null;
  if (frames < 0 || !frames) return callback;
  return function (this: ThisType<T>, ...args: any[]) {
    if (!queuedCallback) {
      raf(
        () => {
          queuedCallback!.apply(this, args);
          queuedCallback = null;
        },
        frames,
        shouldCancel,
      );
    }
    queuedCallback = callback;
  } as T;
}
