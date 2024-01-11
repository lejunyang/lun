import { ExtractPropTypes } from 'vue';
import { GetEventPropsFromEmits, PropBoolean, PropObjOrBool, PropStrOrArr, PropString, editStateProps, themeProps } from 'common';
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
  /** used to freely input and create new select options */
  freeInput: PropBoolean(),

  /** if it's not multiple, will close the pop when select an option */
  autoClose: PropBoolean(),
  /** only for multiple select, will hide selected option in popover */
  hideOptionWhenSelected: PropBoolean(),
  /** only for multiple select, used to determine whether to show some common button in pop content, also can be used to pass button props to those buttons */
  commonButtons: PropObjOrBool<boolean | Record<'selectAll' | 'reverse' | 'clear', ButtonProps | boolean>>(),

  autoActivateFirst: PropBoolean(),
  upDownToggle: PropBoolean(),
  ...omit(popoverProps, ['open', 'content', 'sync', 'type', 'triggers', 'children']),
};

export const selectEmits = {
  update: null,
  inputUpdate: null,
};

export const selectOptionProps = {
  ...themeProps,
  ...editStateProps,
  value: { required: true },
  label: PropString(),
  excludeFromSelect: PropBoolean(),
  /** used to custom render content, if it's truthy, will use CustomRenderer to render content, 'label' will not be rendered, but 'label' will still be used in filter */
  content: {},
  contentType: PropString(),
  contentPreferHtml: PropBoolean(),
  hidden: PropBoolean(),
};

export const selectOptgroupProps = {
  ...themeProps,
  ...editStateProps,
  label: PropString(),
};

export type SelectSetupProps = ExtractPropTypes<typeof selectProps>;
export type SelectEvents = GetEventPropsFromEmits<typeof selectEmits>;
export type SelectProps = Partial<SelectSetupProps> & SelectEvents;

export type SelectOptionSetupProps = ExtractPropTypes<typeof selectOptionProps>;
export type SelectOptionProps = Partial<SelectOptionSetupProps>;

export type SelectOptgroupSetupProps = ExtractPropTypes<typeof selectOptgroupProps>;
export type SelectOptgroupProps = Partial<SelectOptgroupSetupProps>;
