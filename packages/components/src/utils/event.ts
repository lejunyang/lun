import { isFunction } from '@lun/utils';
import type { ObjectEmitsOptions } from 'vue';

export type SimpleFunction = (...args: any[]) => any;
export type PlainObject = Record<string, any>;

type Listener = SimpleFunction & { fn?: any };

export function createPlainEvent<
  E extends ObjectEmitsOptions | readonly string[],
  ListenName = E extends readonly string[] ? E[number] : E extends ObjectEmitsOptions ? keyof E : never
>(_emitsOptions?: E | null) {
  const getListenMap = (() => {
    let events: Map<ListenName, Listener[]>;
    return () => {
      if (!events) {
        events = new Map<ListenName, Listener[]>();
      }
      return events;
    };
  })();

  const listenerCondition = new WeakMap<Function, () => boolean>();

  let hasListener = false;

  const event = {
    on: (listenName: ListenName, fn: SimpleFunction) => {
      hasListener = true;

      const listenMap = getListenMap();
      const map = listenMap.get(listenName);
      if (map) {
        map.push(fn);
      } else {
        listenMap.set(listenName, [fn]);
      }
      return () => event.off(listenName, fn);
    },
    when: (listenName: ListenName, condition: () => boolean, fn: SimpleFunction) => {
      if (isFunction(condition)) listenerCondition.set(fn, condition);
      return event.on(listenName, fn);
    },
    once: (listenName: ListenName, fn: SimpleFunction) => {
      hasListener = true;

      const on: Listener = (...args: any[]) => {
        event.off(listenName, fn);
        fn(...args);
      };
      on.fn = fn; // record that, so we can use that fn to off manually
      event.on(listenName, on);
      return () => event.off(listenName, on);
    },
    off: (listenName: ListenName, fn?: SimpleFunction) => {
      const listenMap = getListenMap();

      const listeners = listenMap.get(listenName);
      if (!listeners) {
        return;
      }

      // clear all
      if (!fn) {
        listenMap.set(listenName, []);
        return;
      }

      const index = listeners.findIndex((listener) => fn === listener || (listener.fn && fn === listener.fn));
      if (index !== -1) listeners.splice(index, 1);
    },
    emit: (listenName: ListenName, ...args: any[]) => {
      const listeners = [...(getListenMap().get(listenName) || [])];
      if (listeners) {
        listeners.forEach((listener) => {
          const condition = listenerCondition.get(listener);
          if (!condition || condition()) listener(...args);
        });
      }
    },
    clear: () => {
      if (hasListener) {
        getListenMap().clear();
      }
    },
  };

  return event;
}

export type PlainEvent = ReturnType<typeof createPlainEvent>;

export type AddEventListener = Element['addEventListener'];
export type RemoveEventListener = Element['removeEventListener'];
export type EventType = Parameters<AddEventListener>[0];
export type EventListener = Parameters<AddEventListener>[1];
export type EventOptions = Parameters<AddEventListener>[2];
export type NotBindEvents = Record<string, ['addEventListener' | 'removeEventListener', EventListener, EventOptions][]>;

/**
 *
 * @param sourceEl
 * @param targetElGetter if it is Function, , it's useful to delay the target element query
 * @param events
 * @returns
 */
export function delegateEvent(
  sourceEl: HTMLElement | null,
  targetElGetter: HTMLElement | null | (() => HTMLElement | null),
  events: string[] | Set<string>,
  options?: { fallbackToSourceWhenNoTarget?: boolean }
) {
  if (!sourceEl || !targetElGetter || !Array.isArray(events)) return;
  const { fallbackToSourceWhenNoTarget } = options || {};
  const originalSourceAdd = sourceEl.addEventListener.bind(sourceEl);
  const originalSourceRemove = sourceEl.removeEventListener.bind(sourceEl);
  let target = targetElGetter instanceof Function ? targetElGetter() : targetElGetter;
  const eventSet = new Set(events);
  const notBindEvents: NotBindEvents = {};

  sourceEl.addEventListener = function (type: EventType, listener: EventListener, options?: EventOptions) {
    if (!target && targetElGetter instanceof Function) {
      target = targetElGetter();
    }
    if (eventSet.has(type)) {
      if (target) target.addEventListener(type, listener, options);
      else if (fallbackToSourceWhenNoTarget) originalSourceAdd(type, listener, options);
      else {
        if (!notBindEvents[type]) notBindEvents[type] = [];
        notBindEvents[type].push(['addEventListener', listener, options]);
      }
    } else originalSourceAdd(type, listener, options);
  };
  sourceEl.removeEventListener = function (type: EventType, listener: EventListener, options?: EventOptions) {
    if (!target && targetElGetter instanceof Function) {
      target = targetElGetter();
    }
    if (eventSet.has(type)) {
      if (target) target.removeEventListener(type, listener, options);
      else if (fallbackToSourceWhenNoTarget) originalSourceRemove(type, listener, options);
      else {
        if (!notBindEvents[type]) notBindEvents[type] = [];
        notBindEvents[type].push(['removeEventListener', listener, options]);
      }
    } else originalSourceRemove(type, listener, options);
  };

  return { addEventListener: originalSourceAdd, removeEventListener: originalSourceRemove, notBindEvents };
}
