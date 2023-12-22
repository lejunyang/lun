import { MaybePromiseOrGetter, usePromiseRef } from '@lun/core';
import { PropType, Ref, StyleValue, WritableComputedRef, toRef } from 'vue';
import { EditStateProps, editStateProps } from '../common/editStateProps';
import { isArray } from '@lun/utils';
import { error, renderElement } from '../utils';
import { ComponentKey } from '../components';

type Style = { class?: any; style?: StyleValue };
export type CommonOption = { label?: string; value: any } & Style & EditStateProps;
export type CommonOptionGroup = {
  label?: string;
  children?: CommonOption[];
} & Style &
  EditStateProps;
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
  M = T extends true ? CommonOptionNameMap : Omit<CommonOptionNameMap, 'children'>,
>(
  _hasChildren?: T,
) => {
  return {
    ...editStateProps,
    options: { type: [Array, Function] as PropType<MaybePromiseOrGetter<CommonOptions<T>>> },
    optionNameMap: { type: Object as PropType<M> },
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
  HasChildren extends boolean = G extends undefined ? false : true,
>(
  props: { options?: MaybePromiseOrGetter<CommonOptions<HasChildren>>; optionNameMap?: CommonOptionNameMap },
  optionName: ComponentKey,
  groupOptionName?: G,
) {
  const [options, loading] = usePromiseRef(toRef(props, 'options'), {
    fallbackWhenReject: (err) => {
      error(err);
      return [];
    },
  }) as readonly [WritableComputedRef<CommonOptions<HasChildren> | undefined>, Ref<boolean>];
  const processOption = (option: any, index: number) => {
    const { optionNameMap } = props;
    if (optionNameMap) {
      const result = { ...option, key: option.value ?? index };
      Object.entries(optionNameMap).forEach(([key, value]) => {
        if (value) result[key] = option[value];
      });
      return result;
    } else return { ...option, key: option.value ?? index };
  };
  const renderOption = (i: any, index: number) => renderElement(optionName, processOption(i, index), i.label);
  const render = () => {
    return (
      isArray(options.value) &&
      options.value.map((i: any, index) => {
        if (groupOptionName && isArray(i.children)) {
          return renderElement(groupOptionName, processOption(i, index), i.children.map(renderOption));
        }
        return renderOption(i, index);
      })
    );
  };
  return { options, render, loading };
}
