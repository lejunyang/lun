import {
  editStateProps,
  themeProps,
  LogicalPosition,
  GetEventPropsFromEmits,
  valueProp,
  PropString,
  PropBoolean,
  CommonProps,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { createOptionProps } from '../../hooks/useOptions';
import { freeze } from '@lun/utils';

export const radioProps = freeze({
  ...editStateProps,
  ...themeProps,
  value: valueProp,
  label: PropString(),
  labelPosition: PropString<LogicalPosition>(),
  checked: PropBoolean(),
  noIndicator: PropBoolean(),

  start: PropBoolean(),
  end: PropBoolean(),
});

export const radioEmits = freeze({
  update: (_detail: any) => null,
});

export type RadioSetupProps = ExtractPropTypes<typeof radioProps>;
export type RadioEvents = GetEventPropsFromEmits<typeof radioEmits>;
export type RadioProps = Partial<RadioSetupProps> & RadioEvents;

export const radioGroupProps = freeze({
  ...createOptionProps(false),
  ...themeProps,
  value: valueProp,
  type: PropString<'radio' | 'button' | 'card'>(),

  noIndicator: PropBoolean(),
  labelPosition: PropString<LogicalPosition>(),
});

export const radioGroupEmits = freeze({
  update: (_detail: any) => null,
});

export type RadioGroupSetupProps = ExtractPropTypes<typeof radioGroupProps> & CommonProps;
export type RadioGroupEvents = GetEventPropsFromEmits<typeof radioGroupEmits>;
export type RadioGroupProps = Partial<RadioGroupSetupProps> & RadioGroupEvents;
