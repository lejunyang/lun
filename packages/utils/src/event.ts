import { isFunction } from './is';
import { AnyFn } from './type';

type Listener = AnyFn & { fn?: any };

export type EventManagerListener = Record<string, ((...args: any[]) => any) | null>;

export function createEventManager<
  E extends EventManagerListener | readonly string[],
  ListenName = E extends readonly string[] ? E[number] : E extends EventManagerListener ? keyof E : never,
>(_events?: E | null) {
  const eventListeners = new Map<ListenName, Set<Listener>>();
  const listenerCondition = new WeakMap<Function, () => boolean>();

  const event = {
    on: (listenName: ListenName, fn: AnyFn) => {
      const set = eventListeners.get(listenName);
      if (set) {
        set.add(fn);
      } else {
        eventListeners.set(listenName, new Set([fn]));
      }
      return () => event.off(listenName, fn);
    },
    when: (listenName: ListenName, condition: () => boolean, fn: AnyFn) => {
      if (isFunction(condition)) listenerCondition.set(fn, condition);
      return event.on(listenName, fn);
    },
    once: (listenName: ListenName, fn: AnyFn) => {
      const on: Listener = (...args: any[]) => {
        event.off(listenName, fn);
        fn(...args);
      };
      on.fn = fn; // record that, so we can use that fn to off manually
      event.on(listenName, on);
      return () => event.off(listenName, on);
    },
    off: (listenName: ListenName, fn?: AnyFn) => {
      const listeners = eventListeners.get(listenName);
      if (!listeners) return;
      // it's clear all if no fn
      if (!fn) {
        eventListeners.set(listenName, new Set());
        return;
      }
      listeners.delete(fn);
    },
    emit: (listenName: ListenName, ...args: any[]) => {
      const listeners = eventListeners.get(listenName);
      if (listeners) {
        listeners.forEach((listener) => {
          const condition = listenerCondition.get(listener);
          if (!condition || condition()) listener(...args);
        });
      }
    },
    clear: () => {
      eventListeners.clear();
    },
  };

  return event;
}
