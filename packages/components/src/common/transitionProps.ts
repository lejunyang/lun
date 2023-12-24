import { capitalize, pick } from '@lun/utils';
import { PropString } from './propConstructor';

const classes = [
  'transition',
  'enterFromClass',
  'enterActiveClass',
  'enterToClass',
  'leaveFromClass',
  'leaveActiveClass',
  'leaveToClass',
] as const;

export function createTransitionProps(): {
  [key in (typeof classes)[number]]: ReturnType<typeof PropString>;
};

export function createTransitionProps<T extends string>(
  name: T,
): {
  [key in (typeof classes)[number] as `${T}${Capitalize<key>}`]: ReturnType<typeof PropString>;
};

export function createTransitionProps(name?: string) {
  return classes.reduce((res, cur) => {
    const key = name ? name + capitalize(cur) : cur;
    res[key] = PropString();
    return res;
  }, {} as any);
}

type TransitionProps = Omit<Record<(typeof classes)[number], string | undefined>, 'transition'> & { name?: string };

export function getTransitionProps(props: Record<(typeof classes)[number], string | undefined>): TransitionProps;

export function getTransitionProps<T extends string>(
  props: Record<`${T}${Capitalize<(typeof classes)[number]>}`, string | undefined>,
  name: T,
): TransitionProps;

export function getTransitionProps(props: Record<string, any>, name?: string) {
  return classes.reduce((res, cur) => {
    res[cur === 'transition' ? 'name' : cur] = props[name ? name + capitalize(cur) : cur];
    return res;
  }, {} as any);
}
