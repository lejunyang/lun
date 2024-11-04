import { ComponentTransition, GlobalContextConfig, OpenShadowComponentKey, useContextConfig } from 'config';
import { isObject, isString } from '@lun-web/utils';
import { TransitionProps } from 'vue';
import { MaybeRefLikeOrGetter, unrefOrGet } from '@lun-web/core';

type ExtractTransitionProps<
  T extends Record<string, unknown>,
  K extends keyof T = keyof T,
> = K extends `${infer P}Transition` ? P : never;

export function useTransition<
  P extends Record<string, any>,
  T extends ExtractTransitionProps<P> = ExtractTransitionProps<P>,
>(props: P, compName: OpenShadowComponentKey, transitionProp: T, defaultTransition?: MaybeRefLikeOrGetter<string>) {
  const config = useContextConfig();
  return () => {
    const val = props[transitionProp];
    const registry = config.transitionRegistry,
      transitionOfConfig = config.transitions[compName][transitionProp];
    let defaultT: string | undefined | null;
    if (isString(val) && registry[val]) return registry[val];
    else if (isObject(val)) return val;
    else if (registry[transitionOfConfig]) return registry[transitionOfConfig];
    else if ((defaultT = unrefOrGet(defaultTransition)) && registry[defaultT]) return registry[defaultT];
  };
}

export function registerTransition(name: string, transition: ComponentTransition, override = false) {
  if (!GlobalContextConfig.transitionRegistry[name] || override)
    GlobalContextConfig.transitionRegistry[name] = transition;
}

const getAnimationHandlers = (
  enterKeyframes: Keyframe[],
  enterOptions: KeyframeAnimationOptions,
  leaveKeyframes: Keyframe[],
  leaveOptions: KeyframeAnimationOptions,
) =>
  ({
    onEnter(el, done) {
      el.animate(enterKeyframes, enterOptions).onfinish = done;
    },
    onLeave(el, done) {
      el.animate(leaveKeyframes, leaveOptions).onfinish = done;
    },
  } as TransitionProps);

const commonOption: KeyframeAnimationOptions = { duration: 300 };
export const registerSwipeTransition = () => {
  const getKeyframes = (factor = -1, axis = 'X') =>
    [
      {
        transform: `translate${axis}(${100 * factor}%)`,
        opacity: 0,
      },
      {
        transform: `translate${axis}(0)`,
        opacity: 1,
      },
    ] as Keyframe[];
  registerTransition(
    'swipeRight',
    getAnimationHandlers(getKeyframes(), commonOption, getKeyframes(1).reverse(), commonOption),
  );
  registerTransition(
    'swipeLeft',
    getAnimationHandlers(getKeyframes(1), commonOption, getKeyframes().reverse(), commonOption),
  );
  registerTransition(
    'swipeUp',
    getAnimationHandlers(getKeyframes(1, 'Y'), commonOption, getKeyframes(-1, 'Y').reverse(), commonOption),
  );
  registerTransition(
    'swipeDown',
    getAnimationHandlers(getKeyframes(-1, 'Y'), commonOption, getKeyframes(1, 'Y').reverse(), commonOption),
  );
};
