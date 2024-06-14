import { AnyFn, createEventManager, isFunction } from '@lun/utils';
import { inject, getCurrentInstance, provide, onBeforeUnmount } from 'vue';

export const EVENT_PROVIDER_KEY = Symbol(__DEV__ ? 'l-event-provider-key' : '');
const ctxKey = Symbol();

export type Events = Record<string, (...args: any[]) => void>;
type EventManager = ReturnType<typeof createEventManager>;

declare module 'vue' {
  interface ComponentInternalInstance {
    /**
     * resolved emits options
     * @internal
     */
    emitsOptions: import('vue').ObjectEmitsOptions | null;
    [ctxKey]: EventManager | undefined;
  }
}

/**
 * Inherit parent's event context. When current component emits an event, it will trigger parent's listener.
 * Also Create an event context to listen to children's event emits
 * It must be called before emit is used(like useValueModel)
 * 
 * Note that you must use the returned emit function to emit events, as in vue setup, the emit func is correct in DEV, not in PROD mode(packages/runtime-core/src/component.ts -> createSetupContext)
 * @param events
 * @returns new emit function
 */
export function useSetupEvent<OriginalEmit extends AnyFn | undefined>(
  events?: Events,
  options?: { toParentWhen?: () => boolean; bubbles?: boolean },
) {
  const { toParentWhen, bubbles = false } = options || {};
  const ctx = getCurrentInstance()!;
  if (!ctx || ctx[ctxKey]) return ctx?.emit as OriginalEmit;
  const manager = (ctx[ctxKey] = createEventManager());
  const { emit, emitsOptions } = ctx;
  const newEmit = (ctx.emit = (event, ...args) => {
    manager.emit(event, ...args);
    emit(event, ...args);
  });

  const parentSubscribedEvents = inject<Events>(EVENT_PROVIDER_KEY);
  const bubbleProvide: Events = {};
  emitsOptions &&
    Object.keys(emitsOptions).forEach((k) => {
      const parentCB = (...args: any[]) => {
        const func = parentSubscribedEvents?.[k];
        if (isFunction(func)) func(...args);
      };
      bubbleProvide[k] = (...args) => {
        if (isFunction(events?.[k])) events![k](...args);
        parentCB(...args);
      };
      toParentWhen ? manager.when(k, toParentWhen, parentCB) : manager.on(k, parentCB);
    });
  provide(EVENT_PROVIDER_KEY, bubbles ? bubbleProvide : events);
  onBeforeUnmount(manager.clear);
  return newEmit as OriginalEmit;
}
