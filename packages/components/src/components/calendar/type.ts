import { DatePanelType, DateValueType } from '@lun-web/core';
import { freeze } from '@lun-web/utils';
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
  createEmits,
} from 'common';
import { ExtractPropTypes } from 'vue';

type DateRaw = DateValueType | DateValueType[] | DateValueType[][];
type DateStr = string | string[] | string[][];

export const calendarProps = freeze({
  ...themeProps,
  ...editStateProps,
  type: PropString<DatePanelType>(),
  value: PropObjOrStr<DateStr | DateRaw>(),
  viewDate: PropObject<DateValueType>(),
  range: PropBoolean(),
  multiple: PropBoolean(),
  format: PropString(),
  yearFormat: PropString(),
  quarterFormat: PropString(),
  monthFormat: PropString(),
  monthBeforeYear: PropBoolean(),
  weekFormat: PropString(),
  dateFormat: PropString(),
  shortMonths: PropArray<string[]>(),
  shortWeekDays: PropArray<string[]>(),
  showTime: PropBoolean(),
  use12Hours: PropBoolean(),
  scrollable: PropBoolean(),
  mini: PropBoolean(),
  /** determine whether to remove the whole row if dates of that row are all preview dates, like the last row in 2024-07 */
  removePreviewRow: PropBoolean(),
  /** determine whether to hide all preview dates in the panel */
  hidePreviewDates: PropBoolean(),
});

export type CalendarUpdateDetail = { value: DateStr; raw: DateRaw };

export const calendarEmits = createEmits<{
  update: CalendarUpdateDetail;
  updateViewDate: DateValueType;
}>(['update', 'updateViewDate']);

export type CalendarSetupProps = ExtractPropTypes<typeof calendarProps> & CommonProps;
export type CalendarEvents = GetEventPropsFromEmits<typeof calendarEmits>;
export type CalendarProps = Partial<CalendarSetupProps> & CalendarEvents;
