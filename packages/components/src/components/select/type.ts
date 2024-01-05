import { ExtractPropTypes } from 'vue';
import { PropBoolean, PropStrOrArr, editStateProps, themeProps } from 'common';
import { popoverProps } from '../popover/type';
import { omit } from '@lun/utils';
import { createOptionProps } from 'hooks';

export const selectProps = {
  ...themeProps,
  ...createOptionProps(true),
  value: PropStrOrArr(),
  multiple: PropBoolean(),
  /** if it's not multiple, will close the pop when select an option */
  autoClose: PropBoolean(),
  /** only for multiple select, will hide selected option in popover */
  hideOptionWhenSelected: PropBoolean(),
  ...omit(popoverProps, ['open', 'content', 'sync', 'type', 'triggers']),
};

export const selectOptionProps = {
  ...themeProps,
  ...editStateProps,
  value: { required: true },
  label: { type: String },
};

export const selectOptgroupProps = {
  ...themeProps,
  ...editStateProps,
  label: { type: String },
};

export type SelectSetupProps = ExtractPropTypes<typeof selectProps>;
export type SelectProps = Partial<SelectSetupProps>;
export type SelectOptionSetupProps = ExtractPropTypes<typeof selectOptionProps>;
export type SelectOptionProps = Partial<SelectOptionSetupProps>;
export type SelectOptgroupSetupProps = ExtractPropTypes<typeof selectOptgroupProps>;
export type SelectOptgroupProps = Partial<SelectOptgroupSetupProps>;