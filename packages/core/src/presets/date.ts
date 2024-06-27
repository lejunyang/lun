import { assignIfNil } from '@lun/utils';
import { processType } from './date.utils';

export type DateMethods<T> = {
  // get
  getNow: () => T;
  getFixedDate: (str: string) => T;
  getEndOfMonth: (date: T) => T;
  getWeekDay: (date: T) => number;

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

  type: {
    add: (type: DateType, date: T, diff: number) => T;
    set: (type: DateType, date: T, val: number) => T;
    get: (type: DateType, date: T) => number;
    isSame: (type: DateType, date1: T | null | undefined, date2: T | null | undefined) => boolean;
    startOf: (type: DateType, date: T) => T;
    baseOf?: (type: DateType, date: T) => T;
  };
};

export type FinalDateMethods<T> = Omit<DateMethods<T>, 'type'> & { type: Required<DateMethods<T>['type'] & {}> };

export type BaseDateType = 'y' | 'M' | 'd' | 'h' | 'm' | 's' | 'Q' | 'w';
export type DateType =
  | BaseDateType
  | 'year'
  | 'years'
  | 'month'
  | 'months'
  | 'day'
  | 'days'
  | 'date'
  | 'dates'
  | 'hour'
  | 'hours'
  | 'minute'
  | 'minutes'
  | 'second'
  | 'seconds'
  | 'quarter'
  | 'quarters'
  | 'week'
  | 'weeks';

export const createDatePreset = <T>(methods: DateMethods<T>) => {
  assignIfNil(methods.type, {
    baseOf(type, date) {
      const t = processType(type);
      const types = ['y', 'M', 'd', 'h', 'm', 's'];
      return methods.type.startOf((types.find((_, i) => types[i + 1] === t) || 'y') as BaseDateType, date);
    },
  });
  return methods as FinalDateMethods<T>;
};
