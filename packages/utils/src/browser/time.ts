import { noop } from "../function";
import { withResolvers } from "../promise";
import { inBrowser } from "./support";

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
  shouldCancel?: () => any,
  notCompose?: number,
) {
  let localCanceled = 0;
  const finalShouldCancel = notCompose ? shouldCancel : () => localCanceled || shouldCancel?.();
  if (!frames || frames < 0) {
    !finalShouldCancel?.() && callback(time);
    return noop;
  }
  const id = requestAnimationFrame((t) => {
    if (finalShouldCancel?.()) return;
    internalRaf(callback, frames - 1, t, finalShouldCancel, 1);
  });
  return () => {
    localCanceled = 1;
    cancelAnimationFrame(id);
  };
}

export function rafThrottle<T extends (...args: any[]) => any>(func: T, frames = 1, shouldCancel?: () => boolean) {
  let queuedCallback: T | null;
  if (frames < 0 || !frames) return func;
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
    queuedCallback = func;
  } as T;
}
