import { editStateProps } from 'common';
import { ExtractPropTypes } from 'vue';

export const switchProps = {
  ...editStateProps,
  checked: { type: Boolean },
  trueValue: { default: true },
  falseValue: { default: false },
};
export type SwitchProps = ExtractPropTypes<typeof switchProps>;
