import { calendarEmits, calendarProps, defineCalendar, CalendarProps, iCalendar } from '@lun-web/components';
import createComponent from '../createComponent';

export const LCalendar = createComponent<CalendarProps, iCalendar>('calendar', defineCalendar, calendarProps, calendarEmits);
if (__DEV__) LCalendar.displayName = 'LCalendar';
