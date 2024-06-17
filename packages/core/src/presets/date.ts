export type DateMethods<T> = {
  // get
  getNow: () => T;
  getFixedDate: (str: string) => T;
  getEndOfMonth: (date: T) => T;
  getWeekDay: (date: T) => number;
  getYear: (date: T) => number;
  getMonth: (date: T) => number;
  /** Get the date of the month, should be 1-31 */
  getDate: (date: T) => number;
  getHour: (date: T) => number;
  getMinute: (date: T) => number;
  getSecond: (date: T) => number;

  // set, must return new object, for add methods, diff can be negative
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
  /** date1 is before date2 */
  isBefore: (date1: T, date2: T) => boolean;
  /** date1 is after date2 */
  isAfter: (date1: T, date2: T) => boolean;
  isValid: (date: unknown) => date is T;

  locale: {
    getWeekFirstDay: (locale: string) => number;
    getWeekFirstDate: (locale: string, date: T) => T;
    /** get week index */
    getWeek: (locale: string, date: T) => number;
    /** get short names of week days, should be an array of 7 strings */
    getShortWeekDays?: (locale: string) => string[];
    getShortMonths?: (locale: string) => string[];
    format: (locale: string, date: T, format: string) => string;
    /** should return null if it's falsy value or failed to parse */
    parse: (
      locale: string,
      value: string | number | Date | T | null | undefined,
      formats: string | string[],
    ) => T | null;
  };
};
