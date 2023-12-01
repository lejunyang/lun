import { editStateProps, themeProps } from 'common';
import { ExtractPropTypes, PropType } from 'vue';

export const radioProps = {
  ...editStateProps,
  ...themeProps,
  value: {},
  label: { type: String },
  labelPosition: { type: String as PropType<LogicalPosition> },
  checked: { type: Boolean },
};

export type RadioProps = ExtractPropTypes<typeof radioProps>;

export type RadioOptions = { label: string; value: any }[];

export const radioGroupProps = {
  ...editStateProps,
  value: {},
  options: { type: Array as PropType<RadioOptions> },
};

export type RadioGroupProps = ExtractPropTypes<typeof radioGroupProps>;
