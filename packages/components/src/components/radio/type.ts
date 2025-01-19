import {
  editStateProps,
  themeProps,
  LogicalPosition,
  GetEventPropsFromEmits,
  valueProp,
  PropString,
  PropBoolean,
  CommonProps,
  undefBoolProp,
  createEmits,
  GetEventMapFromEmits,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { createOptionProps } from '../../hooks/useOptions';
import { freeze } from '@lun-web/utils';

export const radioProps = freeze({
  ...editStateProps,
  ...themeProps,
  value: valueProp,
  label: PropString(),
  labelPosition: PropString<LogicalPosition>(),
  checked: PropBoolean(),
  noIndicator: undefBoolProp, // virtualMerge requires undefined as default

  start: PropBoolean(),
  end: PropBoolean(),
});

export const radioEmits = createEmits<{
  update: unknown;
}>(['update']);

export type RadioSetupProps = ExtractPropTypes<typeof radioProps>;
export type RadioEventProps = GetEventPropsFromEmits<typeof radioEmits>;
export type RadioEventMap = GetEventMapFromEmits<typeof radioEmits>;
export type RadioProps = Partial<RadioSetupProps> & RadioEventProps;

export const radioGroupProps = freeze({
  ...createOptionProps(false),
  ...themeProps,
  value: valueProp,
  type: PropString<'radio' | 'button' | 'card'>(),

  noIndicator: PropBoolean(),
  labelPosition: PropString<LogicalPosition>(),
});

export const radioGroupEmits = createEmits<{
  update: unknown;
}>(['update']);

export type RadioGroupSetupProps = ExtractPropTypes<typeof radioGroupProps> & CommonProps;
export type RadioGroupEventProps = GetEventPropsFromEmits<typeof radioGroupEmits>;
export type RadioGroupEventMap = GetEventMapFromEmits<typeof radioGroupEmits>;
export type RadioGroupProps = Partial<RadioGroupSetupProps> & RadioGroupEventProps;
