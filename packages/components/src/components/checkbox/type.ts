import { editStateProps } from 'common';
import { ExtractPropTypes, PropType } from 'vue';

export const checkboxProps = {
  ...editStateProps,
  value: {},
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
  value: { type: Array },
  looseEqual: { type: Boolean },
  options: { type: Array as PropType<CheckboxOptions> },
  onlyFor: { type: String },
};

export type CheckboxProps = ExtractPropTypes<typeof checkboxProps>;
export type CheckboxGroupProps = ExtractPropTypes<typeof checkboxGroupProps>;
