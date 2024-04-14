import { ComponentKey, getElementFirstName } from '@lun/components';
import { forwardRef, createElement, useRef, useImperativeHandle, useLayoutEffect, ReactNode } from 'react';
import { on, off, inBrowser, capitalize, objectKeys } from '@lun/utils';

/** element => (eventName, objectEventHandler) */
const listenedEvents = new WeakMap<Element, Map<string, EventListenerObject>>();

const patchEvent = (node: Element, event: string, listener: any) => {
  let eventMap = listenedEvents.get(node);
  if (eventMap === undefined) {
    listenedEvents.set(node, (eventMap = new Map()));
  }
  let handler = eventMap.get(event);
  if (listener !== undefined) {
    // use object event listener so that we can easily update the listener
    if (!handler) {
      eventMap.set(event, (handler = { handleEvent: listener }));
      on(node, event, handler);
    } else {
      handler.handleEvent = listener;
    }
  } else if (handler !== undefined) {
    // Remove listener if one exists and value is undefined
    eventMap.delete(event);
    off(node, event, handler);
  }
};

export default function <Props extends Record<string, any>, Instance extends HTMLElement>(
  compName: ComponentKey,
  defineFunc: () => void,
  props: Record<string, any>,
  emits?: Record<string, any>,
) {
  /** onValidClick => validClick */
  const eventMap = new Map(emits ? objectKeys(emits).map((k) => ['on' + capitalize(k), k]) : []);
  return forwardRef<Instance, Props & { children?: ReactNode }>((reactProps, ref) => {
    defineFunc();
    const name = getElementFirstName(compName) as string;
    if (!name) throw new Error(__DEV__ ? 'Invalid component name' : '');

    const compRef = useRef<Instance>();
    useImperativeHandle(ref, () => compRef.current!);
    const prevPropKeySet = useRef(new Set<keyof Props>());
    const remainProps: Record<string, any> = {};

    inBrowser &&
      useLayoutEffect(() => {
        const current = compRef.current as any;
        if (!current) return;
        const newElProps: Record<string, any> = {},
          newPropKeySet = new Set<keyof Props>();
        for (const [key, value] of Object.entries(reactProps)) {
          const event = eventMap.get(key);
          if (event) {
            patchEvent(current, event, value);
          } else if (key in props) {
            current[key] = value;
          } else {
            remainProps[key] = value;
            continue;
          }
          newElProps[key] = value;
          prevPropKeySet.current.delete(key);
          newPropKeySet.add(key);
        }
        // "Unset" any props from previous render that no longer exist
        for (const key of prevPropKeySet.current) {
          const event = eventMap.get(key as any);
          if (event) patchEvent(current, event, undefined);
          else current[key] = undefined;
        }
        prevPropKeySet.current = newPropKeySet;
      });

    return createElement(
      name,
      {
        ...remainProps,
        ref: compRef,
      },
      reactProps.children,
    );
  });
}
