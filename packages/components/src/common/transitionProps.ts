import { isString } from '@lun/utils';
import { transitionProp } from './propConstructor';

export function getTransitionProps<N extends string>(
  props: Record<`${N}Transition`, any>,
  name: N,
  defaultName?: string,
) {
  const key = `${name}Transition` as const,
    val = props[key];
  return isString(val) ? { name: (val as string) ?? defaultName } : { name: defaultName, ...val };
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
