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
    setDate,
    addDate,
    locale: { getWeekFirstDay },
  } = presets.date;
  function isSameYear(year1: DateValueType, year2: DateValueType) {
    return getYear(year1) === getYear(year2);
  }
  function isSameMonth(month1: DateValueType, month2: DateValueType) {
    return getMonth(month1) === getMonth(month2);
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
    const { value, range, format, type, showTime, use12Hours } = options;
    const mergedFormat = getDefaultFormat(format, type, showTime, use12Hours)
  });

  const cells = computed(() => {
    const { value, type, disabledDate, lang, viewDate, min, max, lessThan, moreThan } = options;
    const grid = gridMap[type];
    if (!grid) return [];
    const [rows, cols] = grid;
    const cellInfo: UseDatePanelCells = [];
    const weekFirstDay = getWeekFirstDay(lang);
    const monthStartDate = setDate(viewDate, 1);
    const baseDate = getWeekStartDate(lang, monthStartDate);
    const month = getMonth(viewDate);
    for (let row = 0; row < rows; row++) {
      cellInfo[row] ||= [];
      for (let col = 0; col < cols; col++) {
        const offset = row * cols + col;
        const currentDate = getCellDate(baseDate, offset, type);
        const disabled = disabledDate(currentDate, { type }); // TODO min,max...
        // cellInfo[row][col] = {
        //   disabled,
        //   date: currentDate,
        // };
      }
    }
    return cellInfo;
  });
}
