import { DateValueType } from '@lun/core';
import { freeze } from '@lun/utils';
import {
  GetEventPropsFromEmits,
  CommonProps,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { calendarProps } from '../calendar';

export const datePickerProps = freeze({
  ...calendarProps
});

export const datePickerEmits = freeze({
  update: (_: DateValueType) => null,
  updateViewDate: (_: DateValueType) => null,
});

export type DatePickerSetupProps = ExtractPropTypes<typeof datePickerProps> & CommonProps;
export type DatePickerEvents = GetEventPropsFromEmits<typeof datePickerEmits>;
export type DatePickerProps = Partial<DatePickerSetupProps> & DatePickerEvents;
