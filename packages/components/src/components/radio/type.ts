import { editStateProps, themeProps, LogicalPosition, GetEventPropsFromEmits, valueProp, PropString, PropBoolean } from 'common';
import { ExtractPropTypes } from 'vue';
import { createOptionProps } from '../../hooks/useOptions';

export const radioProps = {
  ...editStateProps,
  ...themeProps,
  value: valueProp,
  label: PropString(),
  labelPosition: PropString<LogicalPosition>(),
  checked: PropBoolean(),

  start: PropBoolean(),
  end: PropBoolean(),
};

export const radioEmits = {
  update: (_detail: any) => null,
};

export type RadioSetupProps = ExtractPropTypes<typeof radioProps>;
export type RadioEvents = GetEventPropsFromEmits<typeof radioEmits>;
export type RadioProps = Partial<RadioSetupProps> & RadioEvents;

export const radioGroupProps = {
  ...createOptionProps(false),
  ...themeProps,
  value: {}, // TODO use valueProp or not?
  type: PropString<'radio' | 'button'>(),
};

export const radioGroupEmits = {
  update: (_detail: any) => null,
};

export type RadioGroupSetupProps = ExtractPropTypes<typeof radioGroupProps>;
export type RadioGroupEvents = GetEventPropsFromEmits<typeof radioGroupEmits>;
export type RadioGroupProps = Partial<RadioGroupSetupProps> & RadioGroupEvents;
