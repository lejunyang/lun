import { ExtractPropTypes } from 'vue';
import { PropBoolean, PropObjOrBool, PropStrOrArr, editStateProps, themeProps } from 'common';
import { popoverProps } from '../popover/type';
import { Constructor, omit } from '@lun/utils';
import { CommonOption, createOptionProps } from 'hooks';
import { ButtonProps } from '../button/type';

export const selectProps = {
  ...themeProps,
  ...createOptionProps(true),
  value: PropStrOrArr(),
  multiple: PropBoolean(),
  filter: PropBoolean(Function as any as Constructor<(inputValue: string | null, option: CommonOption) => boolean>),

  /** if it's not multiple, will close the pop when select an option */
  autoClose: PropBoolean(),
  /** only for multiple select, will hide selected option in popover */
  hideOptionWhenSelected: PropBoolean(),
  /** only for multiple select, used to determine whether to show some common button in pop content, also can be used to pass button props to those buttons */
  commonButtons: PropObjOrBool<boolean | Record<'selectAll' | 'reverse' | 'clear', ButtonProps | boolean>>(),
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
