export type LogicalPosition = 'start' | 'end';

type StringArrayEmits = readonly string[];

type EmitValidator = (...args: any[]) => any;

type ObjectEmitsOptions = { [key: string]: EmitValidator | undefined | null };

type Emits = StringArrayEmits | ObjectEmitsOptions;

type GetCustomEvent<T extends EmitValidator | undefined | null> = T extends (...args: infer U) => any
  ? U extends [any]
    ? CustomEvent<U[0]>
    : CustomEvent<undefined>
  : CustomEvent<undefined>;

type GetCustomEventHandler<T extends EmitValidator | undefined | null> = (e: GetCustomEvent<T>) => void;

export type GetEventPropsFromEmits<T extends Emits> = T extends StringArrayEmits
  ? { [K in T[number] as `on${Capitalize<K>}`]?: (e: CustomEvent) => void }
  : T extends ObjectEmitsOptions
  ? // @ts-ignore
    { [K in keyof T as `on${Capitalize<K>}`]?: GetCustomEventHandler<T[K]> }
  : {};

export type GetEventMapFromEmits<T extends Emits> = T extends StringArrayEmits
  ? { [K in T[number]]: CustomEvent }
  : T extends ObjectEmitsOptions
  ? // @ts-ignore
    { [K in keyof T]: GetCustomEvent<T[K]> }
  : {};

export type Status = 'success' | 'warning' | 'error' | 'info';

export type InputFocusOption = { preventScroll?: boolean; cursor?: 'start' | 'end' | 'all' };

export type CommonProps = {
  innerStyle?: string;
};

export type ElementWithExpose<
  El extends new (props?: Record<string, any>) => any,
  Expose extends Record<string, any>,
> = new (props?: Record<string, any>) => InstanceType<El> & Expose;
