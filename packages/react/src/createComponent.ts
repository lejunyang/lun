import { ComponentKey, GlobalStaticConfig, openShadowCommonProps, openShadowComponents } from '@lun-web/components';
import {
  forwardRef,
  createElement,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
  ReactNode,
  HTMLAttributes,
} from 'react';
import { on, off, inBrowser, capitalize, objectKeys, isArray } from '@lun-web/utils';

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

/*@__NO_SIDE_EFFECTS__*/
export default function <Props extends Record<string, any>, Instance extends HTMLElement>(
  compName: ComponentKey,
  defineFunc: () => void,
  props: Record<string, any>,
  emits?: Record<string, any>,
) {
  /** onValidClick => ValidClick */
  const eventMap = new Map(
      emits
        ? (isArray(emits) ? (emits as string[]) : objectKeys(emits)).map((k) => ['on' + capitalize(k), capitalize(k)])
        : [],
    ),
    getEvent = (key: string) => eventMap.get(key),
    predefinedProps = openShadowComponents.includes(compName as any) ? { ...openShadowCommonProps, ...props } : props;
  let name: string;
  return forwardRef<Instance, Props & { children?: ReactNode } & HTMLAttributes<Instance>>(
    ({ children, ...reactProps }, ref) => {
      defineFunc();
      name ||= GlobalStaticConfig.namespace + '-' + compName;

      // @ts-ignore
      const compRef = useRef<Instance>();
      useImperativeHandle(ref, () => compRef.current!);
      const prevPropKeySet = useRef(new Set<string>());
      const remainProps: Record<string, any> = { ref: compRef },
        elementProps: [key: string, value: any, isEvent?: number][] = [];

      for (const [key, value] of Object.entries(reactProps)) {
        const event = getEvent(key);
        if (event) {
          elementProps.push([event, value, 1]);
        } else if (key in predefinedProps) {
          elementProps.push([key, value]);
        } else {
          // React does not handle `className` for custom elements, need to use `class` instead
          remainProps[key === 'className' ? 'class' : key] = value;
        }
      }

      inBrowser &&
        useLayoutEffect(() => {
          const current = compRef.current as any;
          if (!current) return;
          const newPropKeySet = new Set<string>();
          for (const [key, value, isEvent] of elementProps) {
            if (isEvent) patchEvent(current, key, value);
            else current[key] = value;
            prevPropKeySet.current.delete(key);
            newPropKeySet.add(key);
          }
          // "Unset" any props from previous render that no longer exist
          for (const key of prevPropKeySet.current) {
            const event = getEvent(key);
            if (event) patchEvent(current, event, undefined);
            else current[key] = undefined;
          }
          prevPropKeySet.current = newPropKeySet;
        });

      return createElement(name, remainProps, children);
    },
  );
}
