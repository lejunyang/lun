import { MaybePromise } from '@lun-web/core';
import { freeze } from '@lun-web/utils';
import {
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  PropBoolean,
  PropFunction,
  PropObject,
  PropString,
  createEmits,
  editStateProps,
  themeProps,
  valueProp,
} from 'common';
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
  beforeUpdate: PropFunction<(prevChecked: boolean) => MaybePromise<boolean | void>>(),
});

export const switchEmits = createEmits<{
  update: { value: unknown; checked: boolean };
}>(['update']);

export type SwitchSetupProps = ExtractPropTypes<typeof switchProps> & CommonProps;
export type SwitchEventProps = GetEventPropsFromEmits<typeof switchEmits>;
export type SwitchEventMap = GetEventMapFromEmits<typeof switchEmits>;
export type SwitchProps = Partial<SwitchSetupProps> & SwitchEventProps;
