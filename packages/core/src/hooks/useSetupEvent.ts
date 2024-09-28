import { AnyFn, createEventManager, mergeHandlers, objectKeys, runIfFn } from '@lun/utils';
import { inject, getCurrentInstance, provide, onBeforeUnmount, ComponentInternalInstance } from 'vue';

export const EVENT_PROVIDER_KEY = Symbol(__DEV__ ? 'l-event-provider-key' : '');
const forceBubbleKey = Symbol(__DEV__ ? 'l-event-force-children-bubble' : '');
const ctxKey = Symbol();

export type Events = Record<string, (...args: any[]) => void>;
type EventManager = ReturnType<typeof createEventManager>;


/**
 * Inherit parent's event context. When current component emits an event, it will trigger parent's listener.
 * Also Create an event context to listen to children's event emits
 * It must be called before emit is used(like useValueModel)
 *
 * Note that you must use the returned emit function to emit events, as in vue setup, the emit func is correct in DEV, not in PROD mode(packages/runtime-core/src/component.ts -> createSetupContext)
 * @param listenedEvents
 * @returns new emit function
 */
export function useSetupEvent<OriginalEmit extends AnyFn | undefined>(
  listenedEvents?: Events,
  options?: {
    toParentWhen?: () => boolean;
    bubbles?: boolean;
    forceChildrenBubble?: boolean;
    /** specify events to re-emit from children */
    reEmits?: string[];
  },
) {
  const { toParentWhen, bubbles = false, forceChildrenBubble, reEmits = [] } = options || {};
  const ctx = getCurrentInstance()! as ComponentInternalInstance & {
    [ctxKey]: EventManager | undefined;
    emitsOptions: import('vue').ObjectEmitsOptions | null;
  };
  if (!ctx || ctx[ctxKey]) return ctx?.emit as OriginalEmit;
  const manager = (ctx[ctxKey] = createEventManager());
  const { emit, emitsOptions } = ctx;
  const newEmit = (ctx.emit = (event, ...args) => {
    manager.emit(event, ...args);
    emit(event, ...args);
  });

  const parentSubscribedEvents = inject<Events>(EVENT_PROVIDER_KEY);
  const finalBubbles = bubbles || inject<boolean | undefined>(forceBubbleKey);
  const reEmitsCB = reEmits.reduce((res, k) => {
    res[k] = (...args: any[]) => newEmit(k, ...args);
    return res;
  }, {} as Record<string, AnyFn>);
  const childrenCB = mergeHandlers(listenedEvents, reEmitsCB);
  const bubbleProvide: Events = {};
  objectKeys({ ...emitsOptions, ...parentSubscribedEvents, ...reEmitsCB }).forEach((k) => {
    const parentCB = (...args: any[]) => {
      runIfFn(parentSubscribedEvents?.[k], ...args);
    };
    bubbleProvide[k] = (...args) => {
      runIfFn(childrenCB[k], ...args);
      parentCB(...args);
    };
    toParentWhen ? manager.when(k, toParentWhen, parentCB) : manager.on(k, parentCB);
  });
  provide(EVENT_PROVIDER_KEY, finalBubbles ? bubbleProvide : childrenCB);
  provide(forceBubbleKey, forceChildrenBubble);
  onBeforeUnmount(manager.clear);
  return newEmit as OriginalEmit;
}
