import { ComponentTransition, GlobalContextConfig, OpenShadowComponentKey, useContextConfig } from 'config';
import { isObject, isString } from '@lun-web/utils';
import { computed } from 'vue';

type ExtractTransitionProps<
  T extends Record<string, unknown>,
  K extends keyof T = keyof T,
> = K extends `${infer P}Transition` ? P : never;

export function useTransition<
  P extends Record<string, any>,
  T extends ExtractTransitionProps<P> = ExtractTransitionProps<P>,
>(props: P, compName: OpenShadowComponentKey, transitionProp: T, defaultTransition?: string) {
  const config = useContextConfig();
  return computed(() => {
    const val = props[transitionProp];
    const registry = config.transitionRegistry,
      transitionOfConfig = config.componentTransitions[compName][transitionProp];
    if (isString(val) && registry[val]) return registry[val];
    else if (isObject(val)) return val;
    else if (registry[transitionOfConfig]) return registry[transitionOfConfig];
    else if (defaultTransition && registry[defaultTransition]) return registry[defaultTransition];
  });
}

export function registerTransition(name: string, transition: ComponentTransition, override = false) {
  if (!GlobalContextConfig.transitionRegistry[name] || override)
    GlobalContextConfig.transitionRegistry[name] = transition;
}
