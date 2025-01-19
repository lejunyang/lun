import { ExtractPropTypes } from 'vue';
import {
  GetEventPropsFromEmits,
  PropBoolOrFunc,
  valueProp,
  PropBoolean,
  PropObjOrBool,
  PropString,
  editStateProps,
  themeProps,
  PropObject,
  CommonProps,
  Prop,
  createEmits,
  GetEventMapFromEmits,
} from 'common';
import { popoverProps } from '../popover/type';
import { freeze, MaybeArray, MaybeSet, objectKeys, omit } from '@lun-web/utils';
import { CommonOption, createOptionProps } from 'hooks';
import { ButtonProps } from '../button/type';
import { GetCustomRendererSource } from '../custom-renderer';

export const selectPropsOfPopover = {
  ...omit(popoverProps, [
    'disabled', // must... in case it affect edit props
    'open',
    'content',
    'popWidth',
    'triggers',
    'showArrow',
    'defaultChildren',
    'toggleMode',
    'useTransform',
    'placement',
    ...objectKeys(themeProps),
  ]),
};

export const selectProps = freeze({
  ...themeProps,
  ...createOptionProps(true), // it includes editStateProps
  value: Prop(),
  multiple: PropBoolean(),
  filter: PropBoolOrFunc<boolean | ((inputValue: string | null, option: CommonOption) => boolean)>(),
  /** used to freely input and create new select options */
  freeInput: PropBoolean(),

  /** determine whether to toggle or select the the option when clicking it. it's only for single select, multiple select will always be 'toggle' */
  clickOption: PropString<'toggle' | 'select'>(),
  /** if it's not multiple, will close the pop when select an option */
  autoClose: PropBoolean(),
  /** only for multiple select, will hide selected option in popover */
  hideOptionWhenSelected: PropBoolean(),
  /** only for multiple select, used to determine whether to show some common button in pop content, also can be used to pass button props to those buttons */
  commonButtons: PropObjOrBool<boolean | Record<'selectAll' | 'reverse' | 'clear', ButtonProps | boolean>>(),

  autoActivateFirst: PropBoolean(),
  upDownToggle: PropBoolean(),
  ...selectPropsOfPopover,
});

export const selectEmits = createEmits<{
  update: { value: MaybeArray<unknown> | null; raw: MaybeSet<unknown> | null };
  inputUpdate: string | null;
}>(['update', 'inputUpdate']);

export const selectOptionProps = freeze({
  ...themeProps,
  ...editStateProps,
  value: valueProp,
  label: PropString(),
  excludeFromSelect: PropBoolean(),
  /** used to custom render content, if it's truthy, will use CustomRenderer to render content, 'label' will not be rendered, but 'label' will still be used in filter */
  content: Prop<GetCustomRendererSource>(),
  hidden: PropBoolean(),
  /** internal usage, used when type=teleport */
  selectContext: PropObject(),
});

export const selectOptionEmits = freeze({});

export const selectOptgroupProps = freeze({
  ...themeProps,
  ...editStateProps,
  label: PropString(),
  /** internal usage, used when type=teleport */
  selectContext: PropObject(),
});

export const selectOptgroupEmits = freeze({});

export type SelectSetupProps = ExtractPropTypes<typeof selectProps> & CommonProps;
export type SelectEventProps = GetEventPropsFromEmits<typeof selectEmits>;
export type SelectEventMap = GetEventMapFromEmits<typeof selectEmits>;
export type SelectProps = Partial<SelectSetupProps> & SelectEventProps;

export type SelectOptionSetupProps = ExtractPropTypes<typeof selectOptionProps> & CommonProps;
export type SelectOptionEventProps = GetEventPropsFromEmits<typeof selectOptionEmits>;
export type SelectOptionEventMap = GetEventMapFromEmits<typeof selectOptionEmits>;
export type SelectOptionProps = Partial<SelectOptionSetupProps> & SelectOptionEventProps;

export type SelectOptgroupSetupProps = ExtractPropTypes<typeof selectOptgroupProps> & CommonProps;
export type SelectOptgroupEventProps = GetEventPropsFromEmits<typeof selectOptgroupEmits>;
export type SelectOptgroupEventMap = GetEventMapFromEmits<typeof selectOptgroupEmits>;
export type SelectOptgroupProps = Partial<SelectOptgroupSetupProps> & SelectOptgroupEventProps;
