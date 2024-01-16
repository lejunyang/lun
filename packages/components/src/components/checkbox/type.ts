import { editStateProps, themeProps, LogicalPosition, GetEventPropsFromEmits } from 'common';
import { ExtractPropTypes, PropType } from 'vue';
import { createOptionProps } from '../../hooks/useOptions';

export const checkboxProps = {
  ...editStateProps,
  ...themeProps,
  value: {},
  /**
   * It's not recommended to use trueValue and falseValue in Checkbox, you may want to use Switch instead.
   * They are only used for single Checkbox that's not under CheckboxGroup.
   */
  trueValue: {},
  falseValue: {},
  label: { type: String },
  labelPosition: { type: String as PropType<LogicalPosition> },
  checked: { type: Boolean },
  intermediate: { type: Boolean },
  checkForAll: { type: Boolean },
  onlyFor: { type: String },
  excludeFromGroup: { type: Boolean },
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
  value: { type: Array },
  onlyFor: { type: String },
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
export type CheckboxEvents = GetEventPropsFromEmits<typeof checkboxEmits>
export type CheckboxProps = Partial<CheckboxSetupProps> & CheckboxEvents;
export type CheckboxGroupSetupProps = ExtractPropTypes<typeof checkboxGroupProps>;
export type CheckboxGroupEvents = GetEventPropsFromEmits<typeof checkboxGroupEmits>
export type CheckboxGroupProps = Partial<CheckboxGroupSetupProps> & CheckboxGroupEvents;
