import { computed, reactive, ref, Ref, WritableComputedRef } from 'vue';
import { createDateLocaleMethods, DatePanelType, DateValueType, presets } from '../../presets';
import { MaybeRefLikeOrGetter, ToAllMaybeRefLike, unrefOrGet } from '../../utils';
import { isArray, isEnterDown, isHTMLElement, runIfFn } from '@lun/utils';
import { getDefaultFormat } from './utils';

export type UseDatePanelCell = {
  key: string;
  date: DateValueType;
  text: string;
  state: {
    disabled: boolean;
    selected: boolean;
    hovered: boolean;
    /** date is in one of selected range */
    inRange: boolean;
    inView: boolean;
    now: boolean;
  };
  title?: string;
};
export type UseDatePanelCells = (UseDatePanelCell[] & { key: string })[];

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
  disabledDate?: ((date: DateValueType, info: { type: DatePanelType; selecting?: DateValueType }) => boolean) | boolean;
  getCell: (target: HTMLElement) => [number, number] | undefined;
  onSelect?: (value: DateValueType | [DateValueType, DateValueType] | [DateValueType, DateValueType][]) => void;
  // titleFormat?:
};

/** [rows, cols] */
const gridMap = {
  date: [6, 7],
} as Record<DatePanelType, [number, number]>;

export function useDatePanel(options: UseDatePanelOptions) {
  if (!presets.date)
    throw new Error(__DEV__ ? 'Must set date preset methods before using Date related components' : '');
  const { lang, cellFormat, viewDate, getCell, onSelect } = options;

  // --------- Methods ----------
  const {
    getYear,
    getMonth,
    getDate,
    getWeekDay,
    getNow,
    setDate,
    addDate,
    addMonth,
    addYear,
    isBefore,
    isAfter,
    isValid,
  } = presets.date;
  const { getWeekFirstDay, parse, format } = createDateLocaleMethods(lang);
  const finalParse = (value: any) => (isValid(value) ? value : parse(value, parseFormat.value));
  function isSameYear(year1?: DateValueType, year2?: DateValueType) {
    return (year1 && year2 && getYear(year1) === getYear(year2)) as boolean;
  }
  function isSameMonth(month1?: DateValueType, month2?: DateValueType) {
    return (month1 && month2 && getMonth(month1) === getMonth(month2)) as boolean;
  }
  function isSameDate(date1?: DateValueType, date2?: DateValueType): boolean {
    return isSameYear(date1, date2) && isSameMonth(date1, date2) && getDate(date1!) === getDate(date2!);
  }
  function isSame(v1: DateValueType | undefined, v2: DateValueType | undefined) {
    switch (options.type) {
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
  function formatRangeValue(value: unknown) {
    if (!isArray(value)) return [];
    const start = finalParse(value[0] as any);
    const end = finalParse(value[1] as any);
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
    let { value, range } = options;
    value = unrefOrGet(value);
    if (range === 'multiple') {
      return isArray(value)
        ? (value.map((v) => formatRangeValue(v)).filter((i) => i.length) as [DateValueType, DateValueType][])
        : [];
    } else if (range) {
      return formatRangeValue(value);
    } else return finalParse(value as any);
  });

  const isSelected = (target: DateValueType) => {
    const { range } = options;
    const { value } = processedValue;
    if (range === 'multiple')
      return (value as [DateValueType, DateValueType][]).some(
        (range) => isSame(range[0], target) || isSame(range[1], target),
      );
    else if (range)
      return isSame((value as DateValueType[])[0], target) || isSame((value as DateValueType[])[1], target);
    else return isSame(value as DateValueType, target);
  };

  const isInRange = (target: DateValueType) => {
    const { range } = options;
    const { value } = processedValue;
    if (range === 'multiple')
      return (value as [DateValueType, DateValueType][]).some(
        (range) => isAfter(target, range[0]) || isBefore(target, range[1]),
      );
    else if (range)
      return isAfter(target, (value as DateValueType[])[0]) || isBefore(target, (value as DateValueType[])[1]);
    else return isSame(value as DateValueType, target);
  };

  const isOutOfLimit = computed(() => {
    const { min, max, moreThan, lessThan } = options;
    const minDate = finalParse(min),
      maxDate = finalParse(max),
      dateMoreThan = finalParse(moreThan),
      dateLessThan = finalParse(lessThan);
    return (target: DateValueType) =>
      (minDate && isBefore(target, minDate)) ||
      (dateMoreThan && (isBefore(target, dateMoreThan) || isSame(target, dateMoreThan))) ||
      (maxDate && isAfter(target, maxDate)) ||
      (dateLessThan && (isAfter(target, dateLessThan) || isSame(target, dateLessThan)));
  });

  if (!viewDate.value) viewDate.value = getNow();

  let baseDateStr: string;
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
    const isInView = (target: DateValueType) => {
      switch (type) {
        case 'date':
          return isSameMonth(monthStartDate, target);
        default:
          return false;
      }
    };
    baseDateStr = format(baseDate, parseFormat.value);
    for (let row = 0; row < rows; row++) {
      // @ts-ignore
      cellInfo[row] ||= [];
      let rowKey: string;
      for (let col = 0; col < cols; col++) {
        const offset = row * cols + col;
        const currentDate = getCellDate(baseDate, offset, type);
        if (!col) rowKey = cellInfo[row].key = baseDateStr + '-' + row;
        const disabled = runIfFn(disabledDate, currentDate, { type }) || !!isOutOfLimit.value(currentDate);
        cellInfo[row][col] = {
          key: rowKey! + '-' + col,
          date: currentDate,
          state: {
            disabled,
            selected: isSelected(currentDate),
            hovered: state.hovering && isSame(state.hovering, currentDate),
            inRange: isInRange(currentDate), // TODO add hovering check
            inView: isInView(currentDate),
            now: isSame(currentDate, now),
          },
          text: format(currentDate, unrefOrGet(cellFormat)),
        };
      }
    }
    return cellInfo;
  });

  const /** used to control the direction of the transition */ direction = ref<'right' | 'left' | 'up' | 'down'>();
  const methods = {
    nextMonth() {
      viewDate.value = addMonth(viewDate.value, 1);
      direction.value = 'right';
    },
    prevMonth() {
      viewDate.value = addMonth(viewDate.value, -1);
      direction.value = 'left';
    },
    nextYear() {
      viewDate.value = addYear(viewDate.value, 1);
      direction.value = 'right';
    },
    prevYear() {
      viewDate.value = addYear(viewDate.value, -1);
      direction.value = 'left';
    },
    nextView() {},
    prevView() {},
  };

  const handleIfCell = ({ target }: { target: any }, handle: (cell: UseDatePanelCell) => void) => {
    let indexes: [number, number] | undefined;
    if (isHTMLElement(target) && (indexes = getCell(target))) {
      const [row, col] = indexes;
      const cell = cells.value[row]?.[col];
      if (cell && !cell.state.disabled) handle(cell);
    }
  };
  const selectCell = ({ date }: UseDatePanelCell) => {
    viewDate.value = date;
    const { range } = options;
    state.selecting = range ? date : null;
    if (!range) runIfFn(onSelect, date);
    // TODO handle range
  };
  const handlers = {
    onClick(e: MouseEvent) {
      handleIfCell(e, selectCell);
    },
    onMouseenter(e: MouseEvent) {
      handleIfCell(e, ({ date }) => {
        state.hovering = date;
      });
    },
    onMouseleave(e: MouseEvent) {
      handleIfCell(e, () => {
        state.hovering = null;
      });
    },
    onKeydown(e: KeyboardEvent) {
      if (isEnterDown(e)) {
        handleIfCell(e, selectCell);
      }
    },
  };

  return {
    state,
    cells,
    methods,
    handlers,
    getBaseDateStr() {
      return baseDateStr;
    },
    direction,
  };
}
