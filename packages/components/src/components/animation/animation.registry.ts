import { error, warn } from 'utils';

export type ElementAnimation = {
  keyframes: Keyframe[];
  rtlKeyframes?: Keyframe[];
  options?: KeyframeAnimationOptions;
};

export function getInitialDefaultAnimationRegistry() {
  const defaultAnimationRegistry = {} as Record<string | symbol, ElementAnimation>;
  return new Proxy(defaultAnimationRegistry, {
    set(target, p, newValue, receiver) {
      if (__DEV__ && !p) {
        error(`Do not use falsy animationName`);
        return false;
      }
      if (__DEV__ && !Array.isArray(newValue?.keyframes)) {
        error(`Invalid animation was set on animationRegistry`, newValue);
        return false;
      }
      if (__DEV__ && target[p]) {
        warn(`Animation '${String(p)}' has already been registered, will overwrite the old one:`, target[p]);
      }
      return Reflect.set(target, p, newValue, receiver);
    },
  });
}

export function getInitialElementAnimationRegistry() {
  const elementAnimationMap = new WeakMap<Element, Record<string | symbol, ElementAnimation>>();
  return new Proxy(elementAnimationMap, {});
}
