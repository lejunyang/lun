export type LogicalPosition = 'start' | 'end';

type StringArrayEmits = readonly string[];

type EmitValidator = (...args: any[]) => any;

type ObjectEmitsOptions = { [key: string]: EmitValidator | undefined | null };

type Emits = StringArrayEmits | ObjectEmitsOptions;

type GetCustomEvent<T extends EmitValidator | undefined | null> = T extends (...args: infer U) => any
  ? U extends [any]
    ? (e: CustomEvent<U[0]>) => void
    : (e: CustomEvent<undefined>) => void
  : (e: CustomEvent<undefined>) => void;

export type GetEventPropsFromEmits<T extends Emits> = T extends StringArrayEmits
  ? { [K in T[number] as `on${Capitalize<K>}`]?: (e: CustomEvent) => void }
  : T extends ObjectEmitsOptions
  ? // @ts-ignore
    { [K in keyof T as `on${Capitalize<K>}`]?: GetCustomEvent<T[K]> }
  : {};

export const emitConstructor =
  <T extends any = undefined>() =>
  (_: T) =>
    true;

export type Status = 'success' | 'warning' | 'error' | 'info';

export type InputFocusOption = { preventScroll?: boolean; cursor?: 'start' | 'end' | 'all' };
