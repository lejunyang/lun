import { MaybePromiseOrGetter } from '@lun/core';
import { ExtractPropTypes, PropType, StyleValue } from 'vue';
import { EditStateProps } from '../../common';
import { editStateProps } from '../../common/editStateProps';
import { popoverProps } from '../popover/type';
import { omit } from '@lun/utils';

type Style = { class?: any; style?: StyleValue };
export type SelectOption = { label?: string; value: any } & Style & EditStateProps;
export type SelectOptGroup = { label?: string; children?: SelectOption[] } & Style & EditStateProps;
export type SelectOptions = (SelectOption | SelectOptGroup)[];

export const selectProps = {
  ...editStateProps,
  value: { type: [String, Array] as PropType<any | any[]> },
  multiple: { type: Boolean },
  // TODO MaybePromiseOrGetter CheckboxGroup RadioGroup
  options: { type: [Array, Function] as PropType<MaybePromiseOrGetter<SelectOptions>> },
  ...omit(popoverProps, ['show', 'content', 'fullPopWidth', 'type', 'triggers']),
};

export const selectOptionProps = {
  ...editStateProps,
  value: { required: true },
  label: { type: String },
};

export const selectOptGroupProps = {
  ...editStateProps,
  label: { type: String },
};

export type SelectProps = ExtractPropTypes<typeof selectProps>;
export type SelectOptionProps = ExtractPropTypes<typeof selectOptionProps>;
export type SelectOptGroupProps = ExtractPropTypes<typeof selectOptGroupProps>;

declare module 'vue' {
  export interface IntrinsicElementAttributes {
    'l-select': SelectProps & HTMLAttributes;
    'l-select-option': SelectOptionProps & HTMLAttributes;
    'l-select-optgroup': SelectOptGroupProps & HTMLAttributes;
  }
}
