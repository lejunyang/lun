import { noop } from '../function';

export function on<T extends Event>(
  el: Element | Window | Document | undefined | null,
  event: string,
  handler:
    | ((event: T) => void)
    | {
        handleEvent(object: T): void;
      }
    | EventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  if (!el) return noop;
  // @ts-ignore
  el.addEventListener(event, handler, options);
  return () => off(el, event, handler, options);
}

export function off<T extends Event>(
  el: Element | Window | Document | undefined | null,
  event: string,
  handler:
    | ((event: T) => void)
    | {
        handleEvent(object: T): void;
      },
  options?: boolean | AddEventListenerOptions,
) {
  if (!el) return;
  // @ts-ignore
  el.removeEventListener(event, handler, options);
}

export const onOnce: typeof on = (el, event, handler, options) => {
  return on(el, event, handler, { ...(options as any), once: true });
};

// freeze but don't add readonly type, it's for component's instance element. if's readonly, ts will report error if we modify the props
export const freeze = <T>(o: T) => Object.freeze(o) as T;
