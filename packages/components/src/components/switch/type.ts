import { editStateProps } from 'common';
import { ExtractPropTypes } from 'vue';

export const switchProps = {
  ...editStateProps,
  checked: { type: Boolean },
  trueValue: { },
  falseValue: { },
  trueText: { type: String },
  falseText: { type: String },
  spinProps: { type: Object },
};
export type SwitchProps = ExtractPropTypes<typeof switchProps>;

declare module 'vue' {
  export interface IntrinsicElementAttributes {
    'l-switch': SwitchProps & HTMLAttributes;
  }
}
