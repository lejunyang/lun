export type DateMethods<T> = {
  // get
  getNow: () => T;
  getFixedDate: (str: string) => T;
  getEndOfMonth: (date: T) => T;
  getWeekDay: (date: T) => number;
  getYear: (date: T) => number;
  getMonth: (date: T) => number;
  getDate: (date: T) => number;
  getHour: (date: T) => number;
  getMinute: (date: T) => number;
  getSecond: (date: T) => number;

  // set
  addYear: (date: T, diff: number) => T;
  addMonth: (date: T, diff: number) => T;
  addDate: (date: T, diff: number) => T;
  setYear: (date: T, year: number) => T;
  setMonth: (date: T, month: number) => T;
  setDate: (date: T, num: number) => T;
  setHour: (date: T, hour: number) => T;
  setMinute: (date: T, minute: number) => T;
  setSecond: (date: T, second: number) => T;

  // Compare
  isBefore: (date1: T, date2: T) => boolean;
  isAfter: (date1: T, date2: T) => boolean;
  isValid: (date: T) => boolean;

  locale: {
    getWeekFirstDay: (locale: string) => number;
    getWeekFirstDate: (locale: string, date: T) => T;
    // get week index
    getWeek: (locale: string, date: T) => number;
    getShortWeekDays: (locale: string) => string[];
    getShortMonths: (locale: string) => string[];
    format: (locale: string, date: T, format: string) => string;
    parse: (locale: string, text: string, formats: string[]) => T | null;
  };
};

// const generateConfig: GenerateConfig<Dayjs> = {
//   // get
//   getNow: () => dayjs(),
//   getFixedDate: (string) => dayjs(string, ['YYYY-M-DD', 'YYYY-MM-DD']),
//   getEndOfMonth: (date) => date.endOf('month'),
//   getWeekDay: (date) => {
//     const clone = date.locale('en');
//     return clone.weekday() + clone.localeData().firstDayOfWeek();
//   },
//   getYear: (date) => date.year(),
//   getMonth: (date) => date.month(),
//   getDate: (date) => date.date(),
//   getHour: (date) => date.hour(),
//   getMinute: (date) => date.minute(),
//   getSecond: (date) => date.second(),

//   // set
//   addYear: (date, diff) => date.add(diff, 'year'),
//   addMonth: (date, diff) => date.add(diff, 'month'),
//   addDate: (date, diff) => date.add(diff, 'day'),
//   setYear: (date, year) => date.year(year),
//   setMonth: (date, month) => date.month(month),
//   setDate: (date, num) => date.date(num),
//   setHour: (date, hour) => date.hour(hour),
//   setMinute: (date, minute) => date.minute(minute),
//   setSecond: (date, second) => date.second(second),

//   // Compare
//   isAfter: (date1, date2) => date1.isAfter(date2),
//   isValid: (date) => date.isValid(),

//   locale: {
//     getWeekFirstDay: (locale) => dayjs().locale(parseLocale(locale)).localeData().firstDayOfWeek(),
//     getWeekFirstDate: (locale, date) => date.locale(parseLocale(locale)).weekday(0),
//     getWeek: (locale, date) => date.locale(parseLocale(locale)).week(),
//     getShortWeekDays: (locale) => dayjs().locale(parseLocale(locale)).localeData().weekdaysMin(),
//     getShortMonths: (locale) => dayjs().locale(parseLocale(locale)).localeData().monthsShort(),
//     format: (locale, date, format) => date.locale(parseLocale(locale)).format(format),
//     parse: (locale, text, formats) => {
//       const localeStr = parseLocale(locale);
//       for (let i = 0; i < formats.length; i += 1) {
//         const format = formats[i];
//         const formatText = text;
//         if (format.includes('wo') || format.includes('Wo')) {
//           // parse Wo
//           const year = formatText.split('-')[0];
//           const weekStr = formatText.split('-')[1];
//           const firstWeek = dayjs(year, 'YYYY').startOf('year').locale(localeStr);
//           for (let j = 0; j <= 52; j += 1) {
//             const nextWeek = firstWeek.add(j, 'week');
//             if (nextWeek.format('Wo') === weekStr) {
//               return nextWeek;
//             }
//           }
//           parseNoMatchNotice();
//           return null;
//         }
//         const date = dayjs(formatText, format, true).locale(localeStr);
//         if (date.isValid()) {
//           return date;
//         }
//       }

//       if (text) {
//         parseNoMatchNotice();
//       }
//       return null;
//     },
//   },
// };
