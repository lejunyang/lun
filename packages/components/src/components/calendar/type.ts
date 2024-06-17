import { DateValueType } from '@lun/core';
import { freeze } from '@lun/utils';
import {
  GetEventPropsFromEmits,
  PropBoolean,
  PropObject,
  PropString,
  themeProps,
  CommonProps,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const calendarProps = freeze({
  ...themeProps,
  value: PropObject<DateValueType>(),
  viewDate: PropObject<DateValueType>(),
  format: PropString(),
  cellFormat: PropString(),
  showTime: PropBoolean(),
  use12Hours: PropBoolean(),
});

export const calendarEmits = freeze({});

export type CalendarSetupProps = ExtractPropTypes<typeof calendarProps> & CommonProps;
export type CalendarEvents = GetEventPropsFromEmits<typeof calendarEmits>;
export type CalendarProps = Partial<CalendarSetupProps> & CalendarEvents;
