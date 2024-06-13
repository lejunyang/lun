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


