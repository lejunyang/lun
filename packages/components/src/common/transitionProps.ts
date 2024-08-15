import { isHTMLElement, isObject, isString } from '@lun/utils';
import { transitionProp } from './propConstructor';
import { TransitionProps } from 'vue';

const getHeightHandler = ({ duration }: TransitionProps, isEnter = true) =>
  ((el, done) => {
    if (!isHTMLElement(el)) return;
    const height = el.offsetHeight,
      frames = [{ height: '0px' }, { height: `${height}px` }];
    // @ts-ignore
    const finalDur = isObject(duration) ? (isEnter ? duration.enter : duration.leave) : duration;
    const ani = el.animate(isEnter ? frames : frames.reverse(), {
      duration: +finalDur || 200,
    });
    ani.onfinish = done;
  }) as TransitionProps['onEnter'];

export const addHandlersIfHeight = (obj: TransitionProps) =>
  obj.name === 'height'
    ? {
        ...obj,
        css: false,
        onEnter: getHeightHandler(obj),
        onLeave: getHeightHandler(obj, false),
      }
    : obj;

export function getTransitionProps<N extends string>(
  props: Record<`${N}Transition`, any>,
  name: N,
  defaultName?: string,
) {
  const key = `${name}Transition` as const,
    val = props[key];
  return addHandlersIfHeight(isString(val) ? { name: (val as string) ?? defaultName } : { name: defaultName, ...val });
}

export function createTransitionProps<S extends string[]>(...names: S) {
  return names.reduce(
    (res, cur) => {
      res[`${cur as S[number]}Transition`] = transitionProp;
      return res;
    },
    {} as {
      [k in `${S[number]}Transition`]: typeof transitionProp;
    },
  );
}
