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

export const prevent = (e: Event) => e.preventDefault();

export const iterateEventPath = (e: Event, handle: (t: EventTarget) => void) => {
  for (const target of e.composedPath()) {
    handle(target);
    if (target === e.currentTarget) break;
  }
};
