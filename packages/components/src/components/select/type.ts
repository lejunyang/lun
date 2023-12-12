import { ExtractPropTypes, PropType } from 'vue';
import { editStateProps } from 'common';
import { popoverProps } from '../popover/type';
import { omit } from '@lun/utils';
import { createOptionProps } from 'hooks';

export const selectProps = {
  ...createOptionProps(true),
  value: { type: [String, Array] as PropType<any | any[]> },
  multiple: { type: Boolean },
  ...omit(popoverProps, ['open', 'content', 'fullPopWidth', 'type', 'triggers']),
};

export const selectOptionProps = {
  ...editStateProps,
  value: { required: true },
  label: { type: String },
};

export const selectOptgroupProps = {
  ...editStateProps,
  label: { type: String },
};

export type SelectSetupProps = ExtractPropTypes<typeof selectProps>;
export type SelectProps = Partial<SelectSetupProps>;
export type SelectOptionSetupProps = ExtractPropTypes<typeof selectOptionProps>;
export type SelectOptionProps = Partial<SelectOptionSetupProps>;
export type SelectOptgroupSetupProps = ExtractPropTypes<typeof selectOptgroupProps>;
export type SelectOptgroupProps = Partial<SelectOptgroupSetupProps>;