import { editStateProps, themeProps, LogicalPosition } from 'common';
import { ExtractPropTypes, PropType } from 'vue';
import { createOptionProps } from '../../hooks/useOptions';

export const radioProps = {
  ...editStateProps,
  ...themeProps,
  value: {},
  label: { type: String },
  labelPosition: { type: String as PropType<LogicalPosition> },
  checked: { type: Boolean },
};

export type RadioSetupProps = ExtractPropTypes<typeof radioProps>;
export type RadioProps = Partial<RadioSetupProps>;

export const radioGroupProps = {
  ...createOptionProps(false),
  value: {},
};

export type RadioGroupSetupProps = ExtractPropTypes<typeof radioGroupProps>;
export type RadioGroupProps = Partial<RadioGroupSetupProps>;
