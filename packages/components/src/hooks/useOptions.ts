import { MaybePromiseOrGetter, usePromiseRef } from '@lun/core';
import { PropType, StyleValue, WritableComputedRef } from 'vue';
import { EditStateProps, editStateProps } from '../common/editStateProps';
import { isArray, runIfFn } from '@lun/utils';
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

type OptionNameMap = { label?: string; value?: string; children?: string };
export const createOptionProps = <
  T extends boolean = false,
  M = T extends true ? OptionNameMap : Omit<OptionNameMap, 'children'>
>(
  _hasChildren?: T
) => {
  return {
    ...editStateProps,
    options: { type: [Array, Function] as PropType<MaybePromiseOrGetter<CommonOptions<T>>> },
    optionNameMap: { type: Object as PropType<M> },
  };
};

export function useOptions<
  G extends ComponentKey | undefined,
  HasChildren extends boolean = G extends undefined ? false : true
>(
  props: { options?: MaybePromiseOrGetter<CommonOptions<HasChildren>>; optionNameMap?: OptionNameMap },
  optionName: ComponentKey,
  groupOptionName?: G
) {
  const options = usePromiseRef(() => runIfFn(props.options), {
    fallbackWhenReject: (err) => {
      error(err);
      return [];
    },
  }) as WritableComputedRef<CommonOptions<HasChildren>>;
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
  return { options, render };
}
