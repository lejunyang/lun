import { assignIfNil, identity, objectKeys } from '@lun/utils';

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
    /** will return empty string if it's not valid date */
    format: (locale: string, date: any, format: string) => string;
    /** should return null if it's falsy value or failed to parse */
    parse: (
      locale: string,
      value: string | number | Date | T | null | undefined,
      formats: string | string[],
    ) => T | null;
  };

  // optional methods
  type?: {
    add?: (type: DateType, date: T, diff: number) => T;
    set?: (type: DateType, date: T, val: number) => T;
    isSame?: (type: DateType, date1: T, date2: T) => boolean;
  };
};

type BaseDateType = 'y' | 'M' | 'd' | 'h' | 'm' | 's';
export type DateType =
  | BaseDateType
  | 'year'
  | 'years'
  | 'month'
  | 'months'
  | 'day'
  | 'days'
  | 'hour'
  | 'hours'
  | 'minute'
  | 'minutes'
  | 'second'
  | 'seconds';

const processType = (type: string) => {
  let lType: string;
  return (
    type.length === 1 ? type : ((lType = type.toLowerCase()), lType.startsWith('mo') ? 'M' : lType[0])
  ) as BaseDateType;
};

export const createDate = <T>(methods: DateMethods<T>) => {
  const {
    addYear,
    addMonth,
    addDate,
    setYear,
    setMonth,
    setDate,
    setHour,
    setMinute,
    setSecond,
    getYear,
    getMonth,
    getDate,
    getHour,
    getMinute,
    getSecond,
  } = methods;
  const addMap = {
      y: addYear,
      M: addMonth,
      d: addDate,
    },
    setMap = {
      y: setYear,
      M: setMonth,
      d: setDate,
      h: setHour,
      m: setMinute,
      s: setSecond,
    },
    getMap = {
      y: getYear,
      M: getMonth,
      d: getDate,
      h: getHour,
      m: getMinute,
      s: getSecond,
    };
  assignIfNil(methods, {
    type: {},
  });
  assignIfNil(methods.type!, {
    add(type, date, diff) {
      // @ts-ignore // TODO
      return (addMap[processType(type)] || identity)(date, diff);
    },
    set(type, date, val) {
      return (setMap[processType(type)] || identity)(date, val);
    },
    isSame(type, date1, date2) {
      // TODO milliseconds
      const t = processType(type);
      if (!getMap[t] || !date1 || !date2) return false;
      for (const k of objectKeys(getMap)) {
        if (getMap[k](date1) !== getMap[k](date2)) return false;
        if (k === t) return true;
      }
      return false;
    },
  } satisfies Required<DateMethods<T>['type'] & {}>);
  return methods as Omit<DateMethods<T>, 'type'> & { type: Required<DateMethods<T>['type'] & {}> };
};
