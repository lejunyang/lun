import { editStateProps, themeProps, LogicalPosition, GetEventPropsFromEmits, valueProp } from 'common';
import { ExtractPropTypes, PropType } from 'vue';
import { createOptionProps } from '../../hooks/useOptions';

export const radioProps = {
  ...editStateProps,
  ...themeProps,
  value: valueProp,
  label: { type: String },
  labelPosition: { type: String as PropType<LogicalPosition> },
  checked: { type: Boolean },
};

export const radioEmits = {
  update: (_detail: any) => null,
};

export type RadioSetupProps = ExtractPropTypes<typeof radioProps>;
export type RadioEvents = GetEventPropsFromEmits<typeof radioEmits>;
export type RadioProps = Partial<RadioSetupProps> & RadioEvents;

export const radioGroupProps = {
  ...createOptionProps(false),
  value: {}, // TODO use valueProp or not?
};

export const radioGroupEmits = {
  update: (_detail: any) => null,
};

export type RadioGroupSetupProps = ExtractPropTypes<typeof radioGroupProps>;
export type RadioGroupEvents = GetEventPropsFromEmits<typeof radioGroupEmits>;
export type RadioGroupProps = Partial<RadioGroupSetupProps> & RadioGroupEvents;
