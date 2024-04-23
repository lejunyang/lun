import { isFunction, objectKeys } from '@lun/utils';
import { inject, provide } from 'vue';

const key = Symbol(__DEV__ ? 'useListen' : '');

export function useListen<Events extends Record<string, (...args: any[]) => void>>(events: Events) {
  const parentSubscribedEvents = inject<Events>(key);
  const currentProvide = {} as Events;
  objectKeys(events).forEach((k) => {
    // @ts-ignore
    currentProvide[k] = (...args) => {
      if (isFunction(events?.[k])) events![k](...args);
      if (isFunction(parentSubscribedEvents?.[k])) parentSubscribedEvents![k](...args);
    };
  });
  provide(key, currentProvide);
  return parentSubscribedEvents;
}
