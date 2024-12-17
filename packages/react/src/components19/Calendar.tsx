import { defineCalendar, CalendarProps, iCalendar } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LCalendar = createComponent<CalendarProps, iCalendar>('calendar', defineCalendar);
if (__DEV__) LCalendar.displayName = 'LCalendar';
