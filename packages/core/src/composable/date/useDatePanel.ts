import { computed, reactive } from 'vue';
import { DatePanelType, DateValueType, presets } from '../../presets';
import { MaybeRefLikeOrGetter, ToAllMaybeRefLike, unrefOrGet } from '../../utils';
import { isArray } from '@lun/utils';
import { getDefaultFormat } from './utils';

export type UseDatePanelCells = {
  date: DateValueType;
  disabled: boolean;
  selected: boolean;
  inRange: boolean;
  inView: boolean;
  isNow: boolean;
  title?: string;
}[][];

// export type UseDatePanelState = {
//   cells: UseDatePanelCells;
// };

const gridMap = {
  date: [7, 7],
} as Record<DatePanelType, [number, number]>;

export function useDatePanel(options: {
  value: MaybeRefLikeOrGetter<DateValueType | [DateValueType, DateValueType] | [DateValueType, DateValueType][]>;
  format?: string;
  showTime?: boolean;
  use12Hours?: boolean;
  range: 'single' | 'multiple';
  type: DatePanelType;
  viewDate: DateValueType;
  min: DateValueType;
  max: DateValueType;
  lessThan: DateValueType;
  moreThan: DateValueType;
  lang: string;
  disabledDate: (date: DateValueType, info: { type: DatePanelType; selecting?: DateValueType }) => boolean;
  onBeforeSelect: (date: DateValueType) => void | boolean;
  onSelect: (date: DateValueType) => void;
  // titleFormat?:
}) {
  if (!presets.date)
    throw new Error(__DEV__ ? 'Must set date preset methods before using Date related components' : '');

  // --------- Methods ----------
  const {
    getYear,
    getMonth,
    getDate,
    getWeekDay,
    getNow,
    setDate,
    addDate,
    isBefore,
    isAfter,
    locale: { getWeekFirstDay, parse },
  } = presets.date;
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
  function getWeekStartDate(locale: string, value: DateValueType) {
    const weekFirstDay = getWeekFirstDay(locale);
    const monthStartDate = setDate(value, 1);
    const startDateWeekDay = getWeekDay(monthStartDate);
    let alignStartDate = addDate(monthStartDate, weekFirstDay - startDateWeekDay);
    if (getMonth(alignStartDate) === getMonth(value) && getDate(alignStartDate) > 1) {
      alignStartDate = addDate(alignStartDate, -7);
    }
    return alignStartDate;
  }
  function formatRangeValue(value: unknown, format: string, lang: string) {
    if (!isArray(value)) return [];
    const start = parse(lang, value[0] as any, format);
    const end = parse(lang, value[1] as any, format);
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

  const processedValue = computed(() => {
    const { value, range, format, type, showTime, use12Hours, lang } = options;
    const mergedFormat = getDefaultFormat(format, type, showTime, use12Hours);
    if (range === 'multiple') {
      return isArray(value)
        ? (value.map((v) => formatRangeValue(v, mergedFormat, lang)).filter((i) => i.length) as [
            DateValueType,
            DateValueType,
          ][])
        : [];
    } else if (range) {
      return formatRangeValue(value, mergedFormat, lang);
    } else return parse(lang, value as any, mergedFormat);
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

  const cells = computed(() => {
    const { value, type, disabledDate, lang, viewDate, min, max, lessThan, moreThan } = options;
    const grid = gridMap[type];
    if (!grid) return [];
    const now = getNow();
    const [rows, cols] = grid;
    const cellInfo: UseDatePanelCells = [];
    const weekFirstDay = getWeekFirstDay(lang);
    const monthStartDate = setDate(viewDate, 1);
    const baseDate = getWeekStartDate(lang, monthStartDate);
    const month = getMonth(viewDate);
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
        const disabled = disabledDate(currentDate, { type }); // TODO min,max...
        cellInfo[row][col] = {
          date: currentDate,
          disabled,
          selected: isSelected(currentDate),
          inRange: isInRange(currentDate), // TODO add hovering check
          inView: isInView(currentDate),
          isNow: isSame(type, currentDate, now),
        };
      }
    }
    return cellInfo;
  });

  return {
    state,
    cells,
  };
}
