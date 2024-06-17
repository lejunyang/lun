import { computed, reactive, Ref, WritableComputedRef } from 'vue';
import { createDateLocaleMethods, DatePanelType, DateValueType, presets } from '../../presets';
import { MaybeRefLikeOrGetter, ToAllMaybeRefLike, unrefOrGet } from '../../utils';
import { isArray, runIfFn } from '@lun/utils';
import { getDefaultFormat } from './utils';

export type UseDatePanelCells = {
  date: DateValueType;
  disabled: boolean;
  selected: boolean;
  /** date is in one of selected range */
  inRange: boolean;
  inView: boolean;
  isNow: boolean;
  text: string;
  title?: string;
}[][];

export type UseDatePanelOptions = ToAllMaybeRefLike<
  {
    lang: string;
    cellFormat: string;
  },
  'lang' | 'cellFormat'
> & {
  value: MaybeRefLikeOrGetter<DateValueType | [DateValueType, DateValueType] | [DateValueType, DateValueType][]>;
  viewDate: Ref<DateValueType> | WritableComputedRef<DateValueType>;
  format?: string;
  showTime?: boolean;
  use12Hours?: boolean;
  range?: 'single' | 'multiple';
  type: DatePanelType;
  min?: DateValueType;
  max?: DateValueType;
  lessThan?: DateValueType;
  moreThan?: DateValueType;
  disabledDate?: (date: DateValueType, info: { type: DatePanelType; selecting?: DateValueType }) => boolean;
  // onBeforeSelect: (date: DateValueType) => void | boolean;
  // onSelect: (date: DateValueType) => void;
  // titleFormat?:
};

/** [rows, cols] */
const gridMap = {
  date: [6, 7],
} as Record<DatePanelType, [number, number]>;

export function useDatePanel(options: UseDatePanelOptions) {
  if (!presets.date)
    throw new Error(__DEV__ ? 'Must set date preset methods before using Date related components' : '');
  const { lang, cellFormat, viewDate } = options;

  // --------- Methods ----------
  const { getYear, getMonth, getDate, getWeekDay, getNow, setDate, addDate, addMonth, addYear, isBefore, isAfter } =
    presets.date;
  const { getWeekFirstDay, parse, format } = createDateLocaleMethods(lang);
  const finalParse = (value: any, formats: string | string[]) => parse(value, formats);
  function isSameYear(year1?: DateValueType, year2?: DateValueType) {
    return (year1 && year2 && getYear(year1) === getYear(year2)) as boolean;
  }
  function isSameMonth(month1?: DateValueType, month2?: DateValueType) {
    return (month1 && month2 && getMonth(month1) === getMonth(month2)) as boolean;
  }
  function isSameDate(date1?: DateValueType, date2?: DateValueType): boolean {
    return isSameYear(date1, date2) && isSameMonth(date1, date2) && getDate(date1!) === getDate(date2!);
  }
  function isSame(type: DatePanelType, v1: DateValueType | undefined, v2: DateValueType | undefined) {
    switch (type) {
      case 'date':
        return isSameDate(v1, v2);
      default:
        return false;
    }
  }
  function getWeekStartDate(value: DateValueType) {
    const weekFirstDay = getWeekFirstDay();
    const monthStartDate = setDate(value, 1);
    const startDateWeekDay = getWeekDay(monthStartDate);
    let alignStartDate = addDate(monthStartDate, weekFirstDay - startDateWeekDay);
    if (getMonth(alignStartDate) === getMonth(value) && getDate(alignStartDate) > 1) {
      alignStartDate = addDate(alignStartDate, -7);
    }
    return alignStartDate;
  }
  function formatRangeValue(value: unknown, format: string) {
    if (!isArray(value)) return [];
    const start = finalParse(value[0] as any, format);
    const end = finalParse(value[1] as any, format);
    if (start && end) return isBefore(start, end) ? [start, end] : [end, start];
    else return [];
  }
  function getCellDate(date: DateValueType, offset: number, type: DatePanelType) {
    switch (type) {
      case 'date':
        return addDate(date, offset);
      default:
        return date;
    }
  }
  // --------- Methods ----------

  const state = reactive({
    selecting: null as null | DateValueType,
    hovering: null as null | DateValueType,
  });

  const parseFormat = computed(() => {
    const { format, type, showTime, use12Hours } = options;
    return getDefaultFormat(format, type, showTime, use12Hours);
  });

  const processedValue = computed(() => {
    const { value, range } = options;
    const mergedFormat = parseFormat.value;
    if (range === 'multiple') {
      return isArray(value)
        ? (value.map((v) => formatRangeValue(v, mergedFormat)).filter((i) => i.length) as [
            DateValueType,
            DateValueType,
          ][])
        : [];
    } else if (range) {
      return formatRangeValue(value, mergedFormat);
    } else return finalParse(value as any, mergedFormat);
  });

  const isSelected = (target: DateValueType) => {
    const { range, type } = options;
    const { value } = processedValue;
    if (range === 'multiple')
      return (value as [DateValueType, DateValueType][]).some(
        (range) => isSame(type, range[0], target) || isSame(type, range[1], target),
      );
    else if (range)
      return isSame(type, (value as DateValueType[])[0], target) || isSame(type, (value as DateValueType[])[1], target);
    else return isSame(type, value as DateValueType, target);
  };

  const isInRange = (target: DateValueType) => {
    const { range, type } = options;
    const { value } = processedValue;
    if (range === 'multiple')
      return (value as [DateValueType, DateValueType][]).some(
        (range) => isAfter(target, range[0]) || isBefore(target, range[1]),
      );
    else if (range)
      return isAfter(target, (value as DateValueType[])[0]) || isBefore(target, (value as DateValueType[])[1]);
    else return isSame(type, value as DateValueType, target);
  };

  const isOutOfLimit = computed(() => {
    const { type, min, max, moreThan, lessThan } = options;
    const pf = parseFormat.value;
    const minDate = finalParse(min, pf),
      maxDate = finalParse(max, pf),
      dateMoreThan = finalParse(moreThan, pf),
      dateLessThan = finalParse(lessThan, pf);
    return (target: DateValueType) =>
      (minDate && isBefore(target, minDate)) ||
      (dateMoreThan && (isBefore(target, dateMoreThan) || isSame(type, target, dateMoreThan))) ||
      (maxDate && isAfter(target, maxDate)) ||
      (dateLessThan && (isAfter(target, dateLessThan) || isSame(type, target, dateLessThan)));
  });

  if (!viewDate.value) viewDate.value = getNow();

  const cells = computed(() => {
    const { type, disabledDate } = options;
    const grid = gridMap[type];
    const now = getNow();
    const finalViewDate = unrefOrGet(viewDate) || now;
    if (!grid) return [];
    const [rows, cols] = grid;
    const cellInfo: UseDatePanelCells = [];
    const monthStartDate = setDate(finalViewDate, 1);
    const baseDate = getWeekStartDate(monthStartDate);
    // const month = getMonth(finalViewDate);
    const isInView = (target: DateValueType) => {
      switch (type) {
        case 'date':
          return isSameMonth(monthStartDate, target);
        default:
          return false;
      }
    };
    for (let row = 0; row < rows; row++) {
      cellInfo[row] ||= [];
      for (let col = 0; col < cols; col++) {
        const offset = row * cols + col;
        const currentDate = getCellDate(baseDate, offset, type);
        const disabled = runIfFn(disabledDate, currentDate, { type }) || !!isOutOfLimit.value(currentDate);
        cellInfo[row][col] = {
          date: currentDate,
          disabled,
          selected: isSelected(currentDate),
          inRange: isInRange(currentDate), // TODO add hovering check
          inView: isInView(currentDate),
          isNow: isSame(type, currentDate, now),
          text: format(currentDate, unrefOrGet(cellFormat)),
        };
      }
    }
    return cellInfo;
  });

  const methods = {
    nextMonth() {
      viewDate.value = addMonth(viewDate.value, 1);
    },
    prevMonth() {
      viewDate.value = addMonth(viewDate.value, -1);
    },
    nextYear() {
      viewDate.value = addYear(viewDate.value, 1);
    },
    prevYear() {
      viewDate.value = addYear(viewDate.value, -1);
    },
    nextView() {},
    prevView() {},
  };

  const handlers = {
    onClick() {},
    onDblClick() {},
    onMouseenter() {},
    onMouseleave() { },
    onKeydown() {}
  };

  return {
    state,
    cells,
    methods,
    handlers,
  };
}
