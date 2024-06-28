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
  PropObjOrStr,
  editStateProps,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const calendarProps = freeze({
  ...themeProps,
  ...editStateProps,
  value: PropObjOrStr<DateValueType | DateValueType[] | [DateValueType, DateValueType][]>(),
  viewDate: PropObject<DateValueType>(),
  range: PropBoolean(),
  multiple: PropBoolean(),
  format: PropString(),
  yearFormat: PropString(),
  monthFormat: PropString(),
  monthBeforeYear: PropBoolean(),
  cellFormat: PropString(),
  shortMonths: PropArray<string[]>(),
  shortWeekDays: PropArray<string[]>(),
  showTime: PropBoolean(),
  use12Hours: PropBoolean(),
  scrollable: PropBoolean(),
});

export const calendarEmits = freeze({
  update: (_: DateValueType) => null,
  updateViewDate: (_: DateValueType) => null,
});

export type CalendarSetupProps = ExtractPropTypes<typeof calendarProps> & CommonProps;
export type CalendarEvents = GetEventPropsFromEmits<typeof calendarEmits>;
export type CalendarProps = Partial<CalendarSetupProps> & CalendarEvents;
