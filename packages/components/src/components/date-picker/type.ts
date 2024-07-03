import { DateValueType } from '@lun/core';
import { freeze } from '@lun/utils';
import { GetEventPropsFromEmits, CommonProps, PropObject } from 'common';
import { ExtractPropTypes } from 'vue';
import { calendarProps, CalendarUpdateDetail } from '../calendar';

export const datePickerProps = freeze({
  ...calendarProps,
  popoverProps: PropObject(),
  inputProps: PropObject(),
});

export const datePickerEmits = freeze({
  update: (_: CalendarUpdateDetail) => null,
  updateViewDate: (_: DateValueType) => null,
});

export type DatePickerSetupProps = ExtractPropTypes<typeof datePickerProps> & CommonProps;
export type DatePickerEvents = GetEventPropsFromEmits<typeof datePickerEmits>;
export type DatePickerProps = Partial<DatePickerSetupProps> & DatePickerEvents;
