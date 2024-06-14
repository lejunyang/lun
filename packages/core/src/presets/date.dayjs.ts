import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DateMethods } from './date';
import { presets } from '.';
import { isString, toArrayIfNotNil } from '@lun/utils';

// derived from react-components/picker

const localeMap: Record<string, string> = {
  'zh-CN': 'zh-cn',
};

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

dayjs.extend((_o, c) => {
  // todo support Wo (ISO week)
  const proto = c.prototype;
  const oldFormat = proto.format;
  proto.format = function f(formatStr: string) {
    const str = (formatStr || '').replace('Wo', 'wo');
    return oldFormat.bind(this)(str);
  };
});

const parseLocale = (locale: string) => {
  return localeMap[locale] || locale;
};

export { dayjs };
export type { Dayjs };

const methods = {
  // get
  getNow: () => dayjs(),
  getFixedDate: (string) => dayjs(string, ['YYYY-M-DD', 'YYYY-MM-DD']),
  getEndOfMonth: (date) => date.endOf('month'),
  getWeekDay: (date) => {
    const clone = date.locale('en');
    return clone.weekday() + clone.localeData().firstDayOfWeek();
  },
  getYear: (date) => date.year(),
  getMonth: (date) => date.month(),
  getDate: (date) => date.date(),
  getHour: (date) => date.hour(),
  getMinute: (date) => date.minute(),
  getSecond: (date) => date.second(),

  // set
  addYear: (date, diff) => date.add(diff, 'year'),
  addMonth: (date, diff) => date.add(diff, 'month'),
  addDate: (date, diff) => date.add(diff, 'day'),
  setYear: (date, year) => date.year(year),
  setMonth: (date, month) => date.month(month),
  setDate: (date, num) => date.date(num),
  setHour: (date, hour) => date.hour(hour),
  setMinute: (date, minute) => date.minute(minute),
  setSecond: (date, second) => date.second(second),

  // Compare
  isBefore: (date1, date2) => date1.isBefore(date2),
  isAfter: (date1, date2) => date1.isAfter(date2),
  isValid: (date): date is Dayjs => dayjs.isDayjs(date) && date.isValid(),

  locale: {
    getWeekFirstDay: (locale) => dayjs().locale(parseLocale(locale)).localeData().firstDayOfWeek(),
    getWeekFirstDate: (locale, date) => date.locale(parseLocale(locale)).weekday(0),
    getWeek: (locale, date) => date.locale(parseLocale(locale)).week(),
    getShortWeekDays: (locale) => dayjs().locale(parseLocale(locale)).localeData().weekdaysMin(),
    getShortMonths: (locale) => dayjs().locale(parseLocale(locale)).localeData().monthsShort(),
    format: (locale, date, format) => date.locale(parseLocale(locale)).format(format),
    parse: (locale, text, formats) => {
      if (!text) return null;
      const localeStr = parseLocale(locale);
      formats = toArrayIfNotNil(formats);
      for (let i = 0; i < formats.length; i += 1) {
        const format = formats[i];
        const formatText = text;
        if ((format.includes('wo') || format.includes('Wo')) && isString(formatText)) {
          // parse Wo
          const year = formatText.split('-')[0];
          const weekStr = formatText.split('-')[1];
          const firstWeek = dayjs(year, 'YYYY').startOf('year').locale(localeStr);
          for (let j = 0; j <= 52; j += 1) {
            const nextWeek = firstWeek.add(j, 'week');
            if (nextWeek.format('Wo') === weekStr) {
              return nextWeek;
            }
          }
          // parseNoMatchNotice();
          return null;
        }
        const date = dayjs(formatText, format, true).locale(localeStr);
        if (date.isValid()) {
          return date;
        }
      }
      // if (text) {
      //   parseNoMatchNotice();
      // }
      return null;
    },
  },
} satisfies DateMethods<Dayjs>;

declare module '.' {
  export interface DateInterface {
    date: Dayjs;
  }
}

presets.date = methods;

export default methods;
