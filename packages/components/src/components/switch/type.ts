import { editStateProps, themeProps } from 'common';
import { ExtractPropTypes } from 'vue';

export const switchProps = {
  ...editStateProps,
  ...themeProps,
  checked: { type: Boolean },
  trueValue: { },
  falseValue: { },
  trueText: { type: String },
  falseText: { type: String },
  spinProps: { type: Object },
};
export type SwitchSetupProps = ExtractPropTypes<typeof switchProps>;
export type SwitchProps = Partial<SwitchSetupProps>;
