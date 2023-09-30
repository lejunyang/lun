import { ElementAnimation } from "./animation.registry";
import { GlobalStaticConfig } from "config";

export function registryAnimation(animationName: string, animation: ElementAnimation) {
  GlobalStaticConfig.animationRegistry[animationName] = animation;
}

export function registryElementAnimation(el: Element, animationName: string, animation: ElementAnimation) {
  if (!el || !animationName || !Array.isArray(animation?.keyframes)) return;
  let registry = GlobalStaticConfig.elAnimationRegistry.get(el);
  if (!registry) {
    registry = {};
    GlobalStaticConfig.elAnimationRegistry.set(el, registry);
  }
  registry[animationName] = animation;
}

export function getAnimation(
  animationName: string,
  options?: { dir?: 'rtl' | 'ltr'; element?: Element }
): Pick<ElementAnimation, 'keyframes' | 'options'> {
  const { dir, element } = options || {};
  const elRegistry = element && GlobalStaticConfig.elAnimationRegistry.get(element);
  const animation = elRegistry?.[animationName] || GlobalStaticConfig.animationRegistry[animationName];
  if (animation) {
    if (String(dir).toLowerCase() === 'rtl') {
      return {
        keyframes: animation.rtlKeyframes || animation.keyframes,
        options: animation.options,
      };
    }
    return animation;
  } else
    return {
      keyframes: [],
      options: { duration: 0 },
    };
}
