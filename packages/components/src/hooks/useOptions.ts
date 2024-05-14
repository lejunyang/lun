import { MaybePromiseOrGetter, usePromiseRef } from '@lun/core';
import { PropType, Ref, StyleValue, WritableComputedRef, computed, toRef } from 'vue';
import { isArray, isString } from '@lun/utils';
import { error, renderElement } from '../utils';
import { ComponentKey } from '../components';
import { PropObject, EditStateProps, editStateProps } from 'common';

type Style = { class?: any; style?: StyleValue };
export type CommonProcessedOption = { label?: string; value?: any } & Style & EditStateProps & Record<string, any>;
export type CommonOption = CommonProcessedOption | string;
export type CommonOptionGroup = {
  label?: string;
  children?: CommonOption[];
} & Style &
  EditStateProps &
  Record<string, any>;
export type CommonOptions<HasChildren extends boolean = false> = HasChildren extends true
  ? (CommonOptionGroup | CommonOption)[]
  : CommonOption[];

export type CommonOptionNameMap = { label?: string; value?: string; children?: string };

/**
 * @param _hasChildren if the option has children
 * @returns props for element that has options(like select, radio-group, checkbox-group)
 */
export const createOptionProps = <
  T extends boolean = false,
  M extends object = T extends true ? CommonOptionNameMap : Omit<CommonOptionNameMap, 'children'>,
  HasMapOption extends boolean = false,
>(
  _hasChildren?: T,
  _hasMapOption?: HasMapOption,
) => {
  return {
    ...editStateProps,
    options: {
      type: [Function, Object] as PropType<
        HasMapOption extends true
          ? Record<string, MaybePromiseOrGetter<CommonOptions<T>>> | MaybePromiseOrGetter<CommonOptions<T>>
          : MaybePromiseOrGetter<CommonOptions<T>>
      >,
    },
    optionNameMap: PropObject<M>(),
  };
};

/**
 * Custom hook for handling options in components like select, radio-group, and checkbox-group.
 * @param props - The props object of setup function first parameter that contains options and optionNameMap.
 * @param optionName - The name of the component that renders each option.
 * @param groupOptionName - The name of the component that renders each option group.
 * @returns An object containing the options and a render function.
 */
export function useOptions<
  G extends ComponentKey | undefined = undefined,
  MapOption extends string | undefined = undefined,
  HasChildren extends boolean = G extends undefined ? false : true,
>(
  props: {
    options?: MapOption extends string
      ?
          | Record<string, MaybePromiseOrGetter<CommonOptions<HasChildren>>>
          | MaybePromiseOrGetter<CommonOptions<HasChildren>>
      : MaybePromiseOrGetter<CommonOptions<HasChildren>>;
    optionNameMap?: CommonOptionNameMap;
  },
  optionName: ComponentKey,
  {
    groupOptionName,
    context,
    contextName,
    mapOptionKey,
  }: {
    groupOptionName?: G;
    context?: any;
    contextName?: string;
    /**
     * if mapOption exists, options will be considered as an object or an array.
     * if options is an array, return it;
     * if it's an object, return options[mapOption]
     */
    mapOptionKey?: () => MapOption;
  } = {},
) {
  const [options, loading] = usePromiseRef(toRef(props, 'options'), {
    fallbackWhenReject: (err) => {
      error(err);
      return [];
    },
    fnArgs: mapOptionKey,
  }) as readonly [
    MapOption extends string
      ? WritableComputedRef<CommonOptions<HasChildren> | undefined>
      : WritableComputedRef<CommonOptions<HasChildren> | undefined | Record<string, CommonOptions<HasChildren>>>,
    Ref<boolean>,
  ];
  const processOption = (option: any, index?: number) => {
    if (isString(option)) option = { label: option, value: option };
    const { optionNameMap } = props;
    let result: any;
    if (optionNameMap) {
      result = { ...option, key: option.value ?? index };
      Object.entries(optionNameMap).forEach(([key, value]) => {
        if (value) {
          result[key] = option[value];
          result[value] = undefined;
        }
      });
    } else result = { key: option.value ?? index, ...option };
    const { children } = option;
    // Failed setting prop "children" on <l-select-option>: value undefined is invalid.TypeError: Cannot set property children of #<Element> which has only a getter
    // undefined is not working, must delete it
    delete result.children;
    if (context && contextName) {
      result[contextName] = context;
    }
    return [result, children];
  };
  const renderOption = (_option: any, index?: number) => {
    const [option] = processOption(_option, index);
    return renderElement(optionName, option, option.label);
  };
  const renderOptions = (options?: any) => {
    return (
      (isArray(options) || (mapOptionKey && isArray((options = options?.[mapOptionKey()])))) &&
      options.map((i: any, index) => {
        const [option, children] = processOption(i, index);
        if (groupOptionName && isArray(children)) {
          return renderElement(groupOptionName, option, children.map(renderOption));
        }
        return renderElement(optionName, option, option.label);
      })
    );
  };
  const render = computed(() => renderOptions(options.value));
  return {
    options,
    render,
    loading,
    renderOptions,
    renderOption,
    hasOption() {
      let opts: any;
      if (isArray(options.value)) return !!options.value.length;
      else if (mapOptionKey && isArray((opts = options.value?.[mapOptionKey()]))) return !!opts.length;
    },
  };
}
