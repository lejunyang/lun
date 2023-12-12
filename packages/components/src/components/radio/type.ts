import { editStateProps, themeProps, LogicalPosition } from 'common';
import { ExtractPropTypes, PropType } from 'vue';

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

export type RadioOptions = { label: string; value: any }[];

export const radioGroupProps = {
  ...editStateProps,
  value: {},
  options: { type: Array as PropType<RadioOptions> },
};

export type RadioGroupSetupProps = ExtractPropTypes<typeof radioGroupProps>;
export type RadioGroupProps = Partial<RadioGroupSetupProps>;
