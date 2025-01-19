import { DateValueType } from '@lun-web/core';
import { freeze } from '@lun-web/utils';
import { GetEventPropsFromEmits, CommonProps, PropObject, createEmits, GetEventMapFromEmits } from 'common';
import { ExtractPropTypes } from 'vue';
import { calendarProps, CalendarUpdateDetail } from '../calendar';

export const datePickerProps = freeze({
  ...calendarProps,
  popoverProps: PropObject(),
  inputProps: PropObject(),
});

export const datePickerEmits = createEmits<{
  update: CalendarUpdateDetail;
  updateViewDate: DateValueType;
}>(['update', 'updateViewDate']);

export type DatePickerSetupProps = ExtractPropTypes<typeof datePickerProps> & CommonProps;
export type DatePickerEventProps = GetEventPropsFromEmits<typeof datePickerEmits>;
export type DatePickerEventMap = GetEventMapFromEmits<typeof datePickerEmits>;
export type DatePickerProps = Partial<DatePickerSetupProps> & DatePickerEventProps;
