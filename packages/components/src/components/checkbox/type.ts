import {
  editStateProps,
  themeProps,
  LogicalPosition,
  GetEventPropsFromEmits,
  PropBoolean,
  PropString,
  valueProp,
  CommonProps,
  PropSet,
  createEmits,
  GetEventMapFromEmits,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { createOptionProps } from '../../hooks/useOptions';
import { freeze } from '@lun-web/utils';

export const checkboxProps = freeze({
  ...editStateProps,
  ...themeProps,
  value: valueProp,
  /**
   * It's not recommended to use trueValue and falseValue in Checkbox, you may want to use Switch instead.
   * They are only used for single Checkbox that's not under CheckboxGroup.
   */
  trueValue: valueProp,
  falseValue: valueProp,
  label: PropString(),
  labelPosition: PropString<LogicalPosition>(),
  checked: PropBoolean(),
  intermediate: PropBoolean(),
  checkForAll: PropBoolean(),
  onlyFor: PropString(),
  excludeFromGroup: PropBoolean(),
  type: PropString<'checkbox' | 'card'>(),
});

export type CheckboxUpdateDetail = {
  value: any;
  isCheckForAll: boolean;
  checked: boolean;
  onlyFor?: string;
  excludeFromGroup?: boolean;
};

export const checkboxEmits = createEmits<{
  update: CheckboxUpdateDetail;
}>(['update']);

export const checkboxGroupProps = freeze({
  ...createOptionProps(false),
  ...themeProps,
  value: PropSet(),
  /** used to define an id for current checkbox group, with that, only checkbox with same onlyFor prop will be managed by this group */
  onlyFor: PropString(),
  vertical: PropBoolean(),
  type: PropString<'checkbox' | 'card'>(),
});

export type CheckboxGroupUpdateDetail = {
  value: any[];
  raw: Set<any>;
  allChecked: boolean;
  intermediate: boolean;
};

export const checkboxGroupEmits = createEmits<{
  update: CheckboxGroupUpdateDetail;
}>(['update']);

export type CheckboxSetupProps = ExtractPropTypes<typeof checkboxProps> & CommonProps;
export type CheckboxEventProps = GetEventPropsFromEmits<typeof checkboxEmits>;
export type CheckboxEventMap = GetEventMapFromEmits<typeof checkboxEmits>;
export type CheckboxProps = Partial<CheckboxSetupProps> & CheckboxEventProps;
export type CheckboxGroupSetupProps = ExtractPropTypes<typeof checkboxGroupProps> & CommonProps;
export type CheckboxGroupEventProps = GetEventPropsFromEmits<typeof checkboxGroupEmits>;
export type CheckboxGroupEventMap = GetEventMapFromEmits<typeof checkboxGroupEmits>;
export type CheckboxGroupProps = Partial<CheckboxGroupSetupProps> & CheckboxGroupEventProps;
