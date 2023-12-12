import { editStateProps, themeProps, LogicalPosition } from 'common';
import { ExtractPropTypes, PropType } from 'vue';

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

export type CheckboxOptions = { label: string; value: any }[];

export type CheckboxUpdateDetail = {
  value: any;
  isCheckForAll: boolean;
  checked: boolean;
  onlyFor?: string;
  excludeFromGroup?: boolean;
};

export const checkboxGroupProps = {
  ...editStateProps,
  ...themeProps,
  value: { type: Array },
  options: { type: Array as PropType<CheckboxOptions> },
  onlyFor: { type: String },
};

export type CheckboxSetupProps = ExtractPropTypes<typeof checkboxProps>;
export type CheckboxProps = Partial<CheckboxSetupProps>;
export type CheckboxGroupSetupProps = ExtractPropTypes<typeof checkboxGroupProps>;
export type CheckboxGroupProps = Partial<CheckboxGroupSetupProps>;
