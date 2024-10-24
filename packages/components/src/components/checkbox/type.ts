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
} from 'common';
import { ExtractPropTypes } from 'vue';
import { createOptionProps } from '../../hooks/useOptions';
import { freeze } from '@lun/utils';

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

export const checkboxEmits = freeze({
  update: (_detail: CheckboxUpdateDetail) => null,
});

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

export const checkboxGroupEmits = freeze({
  update: (_detail: CheckboxGroupUpdateDetail) => null,
});

export type CheckboxSetupProps = ExtractPropTypes<typeof checkboxProps> & CommonProps;
export type CheckboxEvents = GetEventPropsFromEmits<typeof checkboxEmits>;
export type CheckboxProps = Partial<CheckboxSetupProps> & CheckboxEvents;
export type CheckboxGroupSetupProps = ExtractPropTypes<typeof checkboxGroupProps> & CommonProps;
export type CheckboxGroupEvents = GetEventPropsFromEmits<typeof checkboxGroupEmits>;
export type CheckboxGroupProps = Partial<CheckboxGroupSetupProps> & CheckboxGroupEvents;
