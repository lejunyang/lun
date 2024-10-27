import { freeze } from '@lun-web/utils';
import { CommonProps, GetEventPropsFromEmits, PropBoolean, PropObject, PropString, editStateProps, themeProps, valueProp } from 'common';
import { ExtractPropTypes } from 'vue';

export const switchProps = freeze({
  ...editStateProps,
  ...themeProps,
  checked: PropBoolean(),
  trueValue: valueProp,
  falseValue: valueProp,
  trueText: PropString(),
  falseText: PropString(),
  spinProps: PropObject(),
});

export const switchEmits = freeze({
  update: (_detail: { value: any; checked: boolean }) => null,
});

export type SwitchSetupProps = ExtractPropTypes<typeof switchProps> & CommonProps;
export type SwitchEvents = GetEventPropsFromEmits<typeof switchEmits>;
export type SwitchProps = Partial<SwitchSetupProps> & SwitchEvents;
