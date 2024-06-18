import { DateValueType } from '@lun/core';
import { freeze } from '@lun/utils';
import {
  GetEventPropsFromEmits,
  PropBoolean,
  PropObject,
  PropString,
  themeProps,
  CommonProps,
  PropArray,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const calendarProps = freeze({
  ...themeProps,
  value: PropObject<DateValueType | [DateValueType, DateValueType] | [DateValueType, DateValueType][]>(),
  viewDate: PropObject<DateValueType>(),
  format: PropString(),
  yearFormat: PropString(),
  monthFormat: PropString(),
  monthBeforeYear: PropBoolean(),
  cellFormat: PropString(),
  shortMonths: PropArray<string[]>(),
  shortWeekDays: PropArray<string[]>(),
  showTime: PropBoolean(),
  use12Hours: PropBoolean(),
});

export const calendarEmits = freeze({
  updateViewDate: (_: DateValueType) => null,
});

export type CalendarSetupProps = ExtractPropTypes<typeof calendarProps> & CommonProps;
export type CalendarEvents = GetEventPropsFromEmits<typeof calendarEmits>;
export type CalendarProps = Partial<CalendarSetupProps> & CalendarEvents;
