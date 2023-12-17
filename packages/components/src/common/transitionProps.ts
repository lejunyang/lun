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

export function getTransitionProps(props: Record<(typeof classes)[number], string | undefined>) {
  return pick(props, Array.from(classes));
}
