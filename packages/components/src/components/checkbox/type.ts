import {
  editStateProps,
  themeProps,
  LogicalPosition,
  GetEventPropsFromEmits,
  PropBoolean,
  PropString,
  PropArray,
  valueProp,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { createOptionProps } from '../../hooks/useOptions';

export const checkboxProps = {
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
};

export type CheckboxUpdateDetail = {
  value: any;
  isCheckForAll: boolean;
  checked: boolean;
  onlyFor?: string;
  excludeFromGroup?: boolean;
};

export const checkboxEmits = {
  update: (_detail: CheckboxUpdateDetail) => null,
};

export const checkboxGroupProps = {
  ...createOptionProps(false),
  ...themeProps,
  value: PropArray(),
  /** used to define an id for current checkbox group, with that, only checkbox with same onlyFor prop will be managed by this group */
  onlyFor: PropString(),
  vertical: PropBoolean(),
};

export type CheckboxGroupUpdateDetail = {
  value: any[];
  allChecked: boolean;
  intermediate: boolean;
};

export const checkboxGroupEmits = {
  update: (_detail: CheckboxGroupUpdateDetail) => null,
};

export type CheckboxSetupProps = ExtractPropTypes<typeof checkboxProps>;
export type CheckboxEvents = GetEventPropsFromEmits<typeof checkboxEmits>;
export type CheckboxProps = Partial<CheckboxSetupProps> & CheckboxEvents;
export type CheckboxGroupSetupProps = ExtractPropTypes<typeof checkboxGroupProps>;
export type CheckboxGroupEvents = GetEventPropsFromEmits<typeof checkboxGroupEmits>;
export type CheckboxGroupProps = Partial<CheckboxGroupSetupProps> & CheckboxGroupEvents;
