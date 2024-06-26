import { computed, nextTick, reactive, ref, Ref, WritableComputedRef } from 'vue';
import { createDateLocaleMethods, DatePanelType, DateValueType, presets } from '../../presets';
import { MaybeRefLikeOrGetter, ToAllMaybeRefLike, unrefOrGet } from '../../utils';
import {
  isArray,
  isArrowDownEvent,
  isArrowLeftEvent,
  isArrowRightEvent,
  isArrowUpEvent,
  isEnterDown,
  isHTMLElement,
  prevent,
  runIfFn,
  toArrayIfNotNil,
} from '@lun/utils';
import { getDefaultFormat } from './utils';

export type UseDatePanelCell = {
  key: string;
  date: DateValueType;
  text: string;
  state: {
    disabled: boolean;
    /** for range=false, stands for if cell is selected and not in a range */
    singleSelected: boolean;
    hovered: boolean;
    /** stands for if cell is the start of a selected range */
    rangeStart: boolean;
    /** stands for if cell is the end of a selected range */
    rangeEnd: boolean;
    /** stands for if cell is in one of selected ranges */
    inRange: boolean;
    /** stands for if cell is the start of a selecting range */
    selectingStart: boolean;
    /** stands for if cell is the end of a selecting range, it's not necessarily same as hovered as we may use keyboard to move */
    selectingEnd: boolean;
    /** stands for if cell is in the selecting range */
    inSelecting: boolean;
    readonly selected: boolean;
    inView: boolean;
    now: boolean;
    focusing: boolean;
  };
  title?: string;
};
export type UseDatePanelCells = (UseDatePanelCell[] & { key: string })[];

export type UseDatePanelOptions = ToAllMaybeRefLike<
  {
    lang: string;
    cellFormat: string;
    getFocusing: HTMLElement;
  },
  'lang' | 'cellFormat'
> & {
  value: MaybeRefLikeOrGetter<DateValueType | DateValueType[] | [DateValueType, DateValueType][]>;
  viewDate: Ref<DateValueType> | WritableComputedRef<DateValueType>;
  format?: string;
  showTime?: boolean;
  use12Hours?: boolean;
  range?: boolean;
  multiple?: boolean;
  type: DatePanelType;
  min?: DateValueType;
  max?: DateValueType;
  lessThan?: DateValueType;
  moreThan?: DateValueType;
  disabledDate?: ((date: DateValueType, info: { type: DatePanelType; selecting?: DateValueType }) => boolean) | boolean;
  prevCells?: boolean; // TODO
  nextCells?: boolean;
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
  const { lang, cellFormat, viewDate, getCell, onSelect, getFocusing } = options;

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
    getEndOfMonth,
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
    /** the start date of a range, meaning the user is selecting a range and just selected the start date */
    selecting: null as null | DateValueType,
    hovering: null as null | DateValueType,
    focusing: null as null | DateValueType,
  });

  const parseFormat = computed(() => {
    const { format, type, showTime, use12Hours } = options;
    return getDefaultFormat(format, type, showTime, use12Hours);
  });

  // --- values ---
  const multiRangeValues = computed(() => {
    const { multiple, range, value } = options,
      values = unrefOrGet(value);
    return multiple && range
      ? isArray(values)
        ? (values.map((v) => formatRangeValue(v)).filter((i) => i.length) as [DateValueType, DateValueType][])
        : []
      : null;
  });
  const rangeValue = computed(() => {
    const { multiple, range, value } = options,
      values = unrefOrGet(value);
    return !multiple && range ? formatRangeValue(values) : null;
  });
  const values = computed(() => toArrayIfNotNil(unrefOrGet(options.value)).map((v) => finalParse(v)));
  // --- values ---

  const isInRange = (target: DateValueType, range: DateValueType[]) =>
    !!range.length && isAfter(target, range[0]) && isBefore(target, range[1]);

  const isOverlapping = ([start1, end1]: DateValueType[], [start2, end2]: DateValueType[]) =>
    isBefore(start1, end2) && isBefore(start2, end1);

  const getSelectState = (target: DateValueType) => {
    const ranges = multiRangeValues.value,
      range = rangeValue.value,
      { selecting, hovering } = state,
      selectingRange = formatRangeValue([selecting, hovering]),
      isSingleSelecting = !hovering && isSame(target, selecting),
      res = {
        singleSelected: false,
        rangeStart: false,
        rangeEnd: false,
        inRange: false,
        selectingStart: isSame(target, selectingRange[0]) || isSingleSelecting,
        selectingEnd: isSame(target, selectingRange[1]) || isSingleSelecting,
        inSelecting: isInRange(target, selectingRange),
      };
    const checkRange = (range: DateValueType[]) => {
      res.rangeStart = isSame(range[0], target);
      if ((res.rangeEnd = isSame(range[1], target)) || res.rangeStart || (res.inRange = isInRange(target, range)))
        return true;
    };
    if (ranges) ranges.find(checkRange);
    else if (range) checkRange(range);
    else res.singleSelected = values.value.some((v) => isSame(v, target));
    return res;
  };

  const isInView = (target: DateValueType, viewDate: DateValueType) => {
    switch (options.type) {
      case 'date':
        return isSameMonth(viewDate, target);
      default:
        return false;
    }
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

  let baseDateStr: string, viewStartDate: DateValueType, viewEndDate: DateValueType;
  const cells = computed(() => {
    const { type, disabledDate } = options;
    const { selecting, hovering, focusing } = state;
    const grid = gridMap[type];
    const now = getNow();
    const finalViewDate = unrefOrGet(viewDate) || now;
    if (!grid) return [];
    const [rows, cols] = grid;
    const cellInfo: UseDatePanelCells = [];
    const monthStartDate = (viewStartDate = setDate(finalViewDate, 1));
    viewEndDate = getEndOfMonth(finalViewDate);
    const baseDate = getWeekStartDate(monthStartDate);
    baseDateStr = format(baseDate, parseFormat.value);
    for (let row = 0; row < rows; row++) {
      // @ts-ignore
      cellInfo[row] ||= [];
      let rowKey: string;
      for (let col = 0; col < cols; col++) {
        const offset = row * cols + col;
        const currentDate = getCellDate(baseDate, offset, type);
        if (!col) rowKey = cellInfo[row].key = baseDateStr + '-' + row;
        const disabled = runIfFn(disabledDate, currentDate, { type, selecting }) || !!isOutOfLimit.value(currentDate);
        cellInfo[row][col] = {
          key: rowKey! + '-' + col,
          date: currentDate,
          state: {
            disabled,
            hovered: isSame(hovering, currentDate),
            inView: isInView(currentDate, monthStartDate),
            now: isSame(currentDate, now),
            focusing: isSame(currentDate, focusing),
            ...getSelectState(currentDate),
            get selected() {
              const { rangeStart, rangeEnd, selectingStart, selectingEnd, singleSelected } = this;
              return rangeStart || rangeEnd || selectingStart || selectingEnd || singleSelected;
            },
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

  const handleIfCell = (e: Event, handle: (cell: UseDatePanelCell, indexes: [number, number]) => void) => {
    let indexes: [number, number] | undefined;
    for (const target of e.composedPath()) {
      if (isHTMLElement(target) && (indexes = getCell(target))) {
        const [row, col] = indexes;
        const cell = cells.value[row]?.[col];
        if (cell && !cell.state.disabled) handle(cell, indexes);
      }
      if (target === e.currentTarget) break;
    }
  };
  const selectCell = ({ date }: UseDatePanelCell) => {
    viewDate.value = date;
    direction.value = isBefore(date, viewStartDate) ? 'down' : isAfter(date, viewEndDate) ? 'up' : undefined;
    const ranges = multiRangeValues.value,
      range = rangeValue.value;
    const { selecting } = state;
    if (ranges) {
      if (selecting) {
        const newRange = formatRangeValue([selecting, date]) as [DateValueType, DateValueType];
        const newRanges = ranges.filter((range) => !isOverlapping(newRange, range));
        newRanges.push(newRange);
        state.selecting = null;
        runIfFn(onSelect, newRanges);
      } else state.selecting = date;
    } else if (range) {
      const newRange = formatRangeValue([selecting, date]);
      state.selecting = newRange.length ? (runIfFn(onSelect, newRange), null) : date;
    } else if (options.multiple) {
      const newValues = values.value.filter((v) => !isSame(v, date)); // click selected date will unselect it
      runIfFn(onSelect, values.value.length === newValues.length ? [...newValues, date] : newValues);
    } else runIfFn(onSelect, date);
  };
  const getOffsetDate = (date: DateValueType, e: KeyboardEvent) => {
    const { type } = options;
    const cols = gridMap[type][1];
    const offset = isArrowUpEvent(e)
      ? -cols
      : isArrowDownEvent(e)
      ? cols
      : isArrowLeftEvent(e)
      ? -1
      : isArrowRightEvent(e)
      ? 1
      : 0;
    switch (type) {
      case 'date':
        return addDate(date, offset);
      default:
        return date;
    }
  };
  const handlers = {
    onClick(e: MouseEvent) {
      handleIfCell(e, selectCell);
    },
    onMouseover(e: MouseEvent) {
      handleIfCell(e, ({ date }) => {
        state.hovering = date;
      });
    },
    onMouseout(e: MouseEvent) {
      handleIfCell(e, () => {
        state.hovering = null;
      });
    },
    onKeydown(e: KeyboardEvent) {
      handleIfCell(e, (cell) => {
        const { date } = cell;
        if (isEnterDown(e)) selectCell(cell);
        else if (isArrowUpEvent(e) || isArrowDownEvent(e) || isArrowLeftEvent(e) || isArrowRightEvent(e)) {
          prevent(e);
          const newDate = getOffsetDate(date, e);
          if (!isInView(newDate, date)) {
            viewDate.value = newDate;
            direction.value = e.key.slice(5).toLowerCase() as any;
          }
          state.focusing = newDate;
          nextTick(() => unrefOrGet(getFocusing)?.focus());
        }
      });
    },
    onFocusin(e: FocusEvent) {
      handleIfCell(e, ({ date }) => (state.focusing = date));
    },
    onFocusout(e: FocusEvent) {
      handleIfCell(e, () => (state.focusing = null));
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
