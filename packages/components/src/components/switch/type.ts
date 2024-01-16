import { GetEventPropsFromEmits, editStateProps, themeProps } from 'common';
import { ExtractPropTypes } from 'vue';

export const switchProps = {
  ...editStateProps,
  ...themeProps,
  checked: { type: Boolean },
  trueValue: {},
  falseValue: {},
  trueText: { type: String },
  falseText: { type: String },
  spinProps: { type: Object },
};

export const switchEmits = {
  update: (_detail: { value: any; checked: boolean }) => null,
};

export type SwitchSetupProps = ExtractPropTypes<typeof switchProps>;
export type SwitchEvents = GetEventPropsFromEmits<typeof switchEmits>;
export type SwitchProps = Partial<SwitchSetupProps> & SwitchEvents;
