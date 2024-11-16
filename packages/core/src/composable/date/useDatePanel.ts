import { computed, nextTick, reactive, ref, Ref, watchEffect, WritableComputedRef } from 'vue';
import {
  BaseDateType,
  createDateTypeMethods,
  DatePanelType,
  DateValueType,
  ExtendBaseDateType,
  presets,
} from '../../presets';
import { ToAllMaybeRefLike, unrefOrGet } from '../../utils';
import {
  capitalize,
  isArray,
  isArrowDownEvent,
  isArrowLeftEvent,
  isArrowRightEvent,
  isArrowUpEvent,
  isEnterDown,
  isHTMLElement,
  iterateEventPath,
  prevent,
  runIfFn,
  ensureArray,
} from '@lun-web/utils';
import { useDateParseFormat } from './utils';
import { processType } from '../../presets/date.utils';

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
    /** stands for if cell is a range of one day */
    oneDayRange: boolean;
    /** stands for if cell is the start of a selecting range */
    selectingStart: boolean;
    /** stands for if cell is the end of a selecting range, it's not necessarily same as hovered as we may use keyboard to move */
    selectingEnd: boolean;
    /** stands for if cell is in the selecting range */
    inSelecting: boolean;
    readonly selected: boolean;
    inView: boolean;
    readonly preview: boolean;
    now: boolean;
    focusing: boolean;
  };
  title?: string;
};
export type UseDatePanelCells = (UseDatePanelCell[] & { key: string; allPreviewDates: boolean })[] & {
  key: string;
  viewStartDate: DateValueType;
  viewEndDate: DateValueType;
};

export type UseDatePanelOptions = ToAllMaybeRefLike<
  {
    lang: string;
    enablePrevCells?: boolean;
    enableNextCells?: boolean;
    value: DateValueType | DateValueType[] | [DateValueType, DateValueType][];
    dateFormat: string;
    yearFormat: string;
    monthFormat: string;
    quarterFormat: string;
    weekFormat: string;
  },
  true
> &
  ToAllMaybeRefLike<{
    getFocusing: HTMLElement;
    enablePrevCells?: boolean;
    enableNextCells?: boolean;
    value: DateValueType | DateValueType[] | [DateValueType, DateValueType][];
  }> & {
    viewDate: Ref<DateValueType | undefined> | WritableComputedRef<DateValueType | undefined>;
    format?: string;
    showTime?: boolean;
    use12Hours?: boolean;
    range?: boolean;
    multiple?: boolean;
    type: DatePanelType;
    shortMonths?: string[];
    shortWeekDays?: string[];
    min?: DateValueType;
    max?: DateValueType;
    lessThan?: DateValueType;
    moreThan?: DateValueType;
    disableDate?:
      | ((
          date: DateValueType,
          info: { type: DatePanelType; selecting?: DateValueType; pickingType: DatePanelType },
        ) => boolean)
      | boolean;
    hidePreviewDates?: boolean;
    getCell: (target: HTMLElement) => [number, number] | undefined;
    onSelect?: (
      value: DateValueType | [DateValueType, DateValueType] | [DateValueType, DateValueType][],
      valStr: string | [string, string] | [string, string][],
    ) => void;
    beforeViewChange?: (offset: number) => Promise<void> | void;
    // titleFormat?:
  };

/** [rows, cols] */
const gridMap = {
  d: [6, 7],
  w: [6, 7],
  M: [4, 3],
  Q: [1, 4],
  y: [4, 3],
} as Record<BaseDateType | ExtendBaseDateType, [number, number]>;
/** date offset for each panel type */
const panelOffsetMap = {
  de: ['y', 100],
  y: ['y', 10],
  Q: ['y', 1],
  M: ['y', 1],
  w: ['M', 1],
  d: ['M', 1],
} as Record<BaseDateType | ExtendBaseDateType, [BaseDateType, number]>;

const defaultFormatMap = {
  y: 'YYYY',
  d: 'D',
} as Record<BaseDateType | ExtendBaseDateType, string>;

const year = 'year',
  quarter = 'quarter',
  month = 'month',
  week = 'week',
  date = 'date';
const panelTypes = [year, quarter, month, week, date] as const;
const panelTypeChain = {
  [year]: [year] as const,
  [quarter]: [year, quarter] as const,
  [month]: [year, month] as const,
  [week]: [year, month, week] as const,
  [date]: [year, month, date] as const,
};
const panelTypeSet = new Set(panelTypes);
export const isDatePanelType = (type: any): type is DatePanelType => panelTypeSet.has(type);

export function useDatePanel(options: UseDatePanelOptions) {
  if (!presets.date)
    throw new Error(__DEV__ ? 'Must set date preset methods before using Date related components' : '');
  const { value, viewDate, getCell, onSelect, getFocusing, enablePrevCells, enableNextCells, beforeViewChange } =
    options;
  /** intermediate panel type when user is picking a part of a date(e.g. picking the year for a date) */
  const pickingType = ref() as Ref<DatePanelType>;
  watchEffect(() => {
    pickingType.value = options.type || 'date';
  });

  // --------- Methods ----------
  const {
    getWeekDay,
    getNow,
    isBefore,
    isAfter,
    type: { get, add: typeAdd, endOf, startOf },
  } = presets.date;
  const { isSame, add, set } = createDateTypeMethods(() => pickingType.value);
  const { parse, format, getWeekFirstDay, getShortMonths } = useDateParseFormat(options);

  const getWeekStartDate = (value: DateValueType) => {
    const weekFirstDay = getWeekFirstDay();
    const monthStartDate = set(value, 1);
    const startDateWeekDay = getWeekDay(monthStartDate);
    let alignStartDate = add(monthStartDate, weekFirstDay - startDateWeekDay);
    if (get('M', alignStartDate) === get('M', value) && get('d', alignStartDate) > 1) {
      alignStartDate = add(alignStartDate, -7);
    }
    return alignStartDate;
  };
  const formatRangeValue = (value: unknown) => {
    if (!isArray(value)) return [];
    const start = parse(value[0] as any);
    const end = parse(value[1] as any);
    if (start && end) return isBefore(start, end) ? [start, end] : [end, start];
    else return [];
  };
  const getProcessedType = () => processType(pickingType.value);
  const getPanelOffset = () => panelOffsetMap[getProcessedType()];
  const viewStartOf = (date: DateValueType) => {
    const [t, offset] = getPanelOffset();
    const base = startOf(t, date);
    if (offset > 1) {
      // year: offset 10 => 2024 => 2020
      // decade: offset 100 => 2024 => 2000
      return set(base, Math.floor(get(t, base) / offset) * offset);
    }
    return base;
  };
  const viewEndOf = (date: DateValueType) => {
    const [t, offset] = getPanelOffset();
    if (offset > 1) {
      // year: offset 10 => 2024 => 2020 => 2029
      // decade: offset 100 => 2024 => 2000 => 2099
      return add(viewStartOf(date), offset - 1);
    }
    return endOf(t, date);
  };
  const panelStartOf = (viewStartDate: DateValueType) => {
    const [t, offset] = getPanelOffset();
    if (t === 'M') return getWeekStartDate(viewStartDate);
    else if (t === 'y' && offset === 1) return viewStartDate;
    else return add(viewStartDate, -offset / 10); // year and decade
  };
  const getCellText = (date: DateValueType, specifiedType?: DatePanelType) => {
    let { shortMonths } = options;
    const finalType = specifiedType || pickingType.value;
    const formatStr = unrefOrGet(options[`${finalType}Format`]);
    switch (finalType) {
      // case 'date':
      //   const weekFirstDay = getWeekFirstDay();
      //   shortWeekDays ||= runIfFn(getShortWeekDays) || [];
      //   return formatStr ? format(date, formatStr) : shortWeekDays[(i + weekFirstDay) % 7];
      case 'month':
        if (!isArray(shortMonths)) shortMonths = runIfFn(getShortMonths) || [];
        return formatStr
          ? format(date, formatStr)
          : shortMonths[get('M', date)] || format(date, defaultFormatMap[processType(finalType)]);
      default:
        return format(date, formatStr || defaultFormatMap[processType(finalType)]);
    }
  };
  // --------- Methods ----------

  const initState = {
    /** the start date of a range, meaning the user is selecting a range and just selected the start date */
    selecting: null as null | DateValueType,
    hovering: null as null | DateValueType,
    focusing: null as null | DateValueType,
  };
  const state = reactive(initState);
  watchEffect(() => {
    // @ts-ignore
    const { range, type, multiple } = options; // when these change, reset state
    Object.assign(state, initState);
  });

  // --- values ---
  const multiRangeValues = computed(() => {
    const { multiple, range } = options,
      values = unrefOrGet(value);
    return multiple && range
      ? isArray(values)
        ? ((values as unknown[]).map((v) => formatRangeValue(v)).filter((i) => i.length) as [
            DateValueType,
            DateValueType,
          ][])
        : []
      : null;
  });
  const rangeValue = computed(() => {
    const { multiple, range } = options,
      values = unrefOrGet(value);
    return !multiple && range ? formatRangeValue(values) : null;
  });
  const values = computed(() => ensureArray(unrefOrGet(value)).map((v) => parse(v)) as DateValueType[]);
  // --- values ---

  const isInRange = (target: DateValueType, range: DateValueType[]) =>
    !!range.length && isAfter(target, range[0]) && isBefore(target, range[1]);

  const isOverlapping = ([start1, end1]: DateValueType[], [start2, end2]: DateValueType[]) =>
    isBefore(start1, end2) && isBefore(start2, end1);

  const isLastPickingType = () => pickingType.value === options.type;

  const getSelectState = (target: DateValueType) => {
    const ranges = multiRangeValues.value,
      range = rangeValue.value,
      { selecting, hovering, focusing } = state,
      selectingEnd = hovering || focusing,
      selectingRange = formatRangeValue([selecting, selectingEnd]),
      isSingleSelecting = !selectingEnd && isSame(target, selecting),
      res = {
        singleSelected: false,
        rangeStart: false,
        rangeEnd: false,
        inRange: false,
        oneDayRange: false,
        selectingStart: isLastPickingType() && (isSame(target, selectingRange[0]) || isSingleSelecting),
        selectingEnd: isLastPickingType() && (isSame(target, selectingRange[1]) || isSingleSelecting),
        inSelecting: isLastPickingType() && isInRange(target, selectingRange),
      };
    const checkRange = (range: DateValueType[]) => {
      res.rangeStart ||= isSame(range[0], target);
      ((res.rangeEnd ||= isSame(range[1], target)) && (res.oneDayRange ||= isSame(range[0], range[1]))) ||
        res.rangeStart ||
        (res.inRange ||= isInRange(target, range));
    };
    if (!isLastPickingType()) return res;
    if (ranges)
      ranges.forEach(checkRange); // do not use find, need to check all. cause for one date, it can be two ranges' edge
    else if (range) checkRange(range);
    else res.singleSelected = values.value.some((v) => isSame(v, target));
    return res;
  };

  const isInView = (target: DateValueType, viewDate: DateValueType) => {
    return isSame(viewStartOf(viewDate), viewStartOf(target));
  };

  const isOutOfLimit = computed(() => {
    const { min, max, moreThan, lessThan } = options;
    const minDate = parse(min),
      maxDate = parse(max),
      dateMoreThan = parse(moreThan),
      dateLessThan = parse(lessThan);
    return (target: DateValueType) =>
      (minDate && isBefore(target, minDate)) ||
      (dateMoreThan && (isBefore(target, dateMoreThan) || isSame(target, dateMoreThan))) ||
      (maxDate && isAfter(target, maxDate)) ||
      (dateLessThan && (isAfter(target, dateLessThan) || isSame(target, dateLessThan)));
  });

  const getCells = (viewDate: DateValueType) => {
    const viewStartDate = viewStartOf(viewDate),
      viewEndDate = viewEndOf(viewDate),
      panelStartDate = panelStartOf(viewStartDate);
    const { type, disableDate } = options;
    const grid = gridMap[getProcessedType()];
    const [rows, cols] = grid;
    const now = getNow();
    const { selecting, hovering, focusing } = state;
    const panelStartDateStr = format(panelStartDate);
    const cellInfo: UseDatePanelCells = Object.assign([], { key: panelStartDateStr, viewStartDate, viewEndDate });
    for (let row = 0; row < rows; row++) {
      // @ts-ignore
      cellInfo[row] ||= [];
      let rowKey: string,
        rowAllPreview = true;
      for (let col = 0; col < cols; col++) {
        const offset = row * cols + col;
        const currentDate = add(panelStartDate, offset);
        if (!col) rowKey = cellInfo[row].key = panelStartDateStr + '-' + row;
        const disabled =
          runIfFn(disableDate, currentDate, { type, selecting, pickingType: pickingType.value }) ||
          !!isOutOfLimit.value(currentDate);
        const inView = isInView(currentDate, viewStartDate);
        if (inView) rowAllPreview = false;
        cellInfo[row][col] = {
          key: rowKey! + '-' + col,
          date: currentDate,
          state: {
            disabled,
            hovered: isSame(hovering, currentDate),
            inView,
            get preview() {
              return !this.inView;
            },
            now: isSame(currentDate, now),
            focusing: isSame(currentDate, focusing),
            ...getSelectState(currentDate),
            get selected() {
              const { rangeStart, rangeEnd, selectingStart, selectingEnd, singleSelected } = this;
              return rangeStart || rangeEnd || selectingStart || selectingEnd || singleSelected;
            },
          },
          text: getCellText(currentDate),
        };
      }
      cellInfo[row].allPreviewDates = rowAllPreview;
    }
    return cellInfo;
  };

  const getInitialViewDate = () =>
    viewStartOf(multiRangeValues.value?.[0]?.[0] || rangeValue.value?.[0] || values.value[0] || getNow());
  const getViewDate = () => unrefOrGet(viewDate) || getInitialViewDate();
  if (!viewDate.value) viewDate.value = getViewDate();
  const cells = computed(() => getCells(getViewDate()));
  /** cells for previous date panel */
  const prevCells = computed(() => {
    if (!unrefOrGet(enablePrevCells)) return [];
    const [t, offset] = getPanelOffset();
    return getCells(typeAdd(t, getViewDate(), -offset));
  });
  /** cells for next date panel */
  const nextCells = computed(() => {
    if (!unrefOrGet(enableNextCells)) return [];
    const [t, offset] = getPanelOffset();
    return getCells(typeAdd(t, getViewDate(), offset));
  });

  const /** used to control the direction of panel's transition */ direction = ref<'right' | 'left' | 'up' | 'down'>();
  const createMethod = (next: boolean, type?: BaseDateType, offset?: number) => async () => {
    const [t, _offset] = getPanelOffset();
    await runIfFn(beforeViewChange, next ? 1 : -1);
    viewDate.value = typeAdd(type ?? t, viewDate.value!, (offset ?? _offset) * (next ? 1 : -1));
    direction.value = next ? 'right' : 'left';
  };
  const getIndexOfType = (type: DatePanelType) => panelTypes.findIndex((t) => t === type);
  const methods = {
    nextMonth: createMethod(true, 'M', 1),
    prevMonth: createMethod(false, 'M', 1),
    nextYear: createMethod(true, 'y', 1),
    prevYear: createMethod(false, 'y', 1),
    nextView: createMethod(true),
    prevView: createMethod(false),
    ...(Object.fromEntries(
      panelTypes.map((t) => [
        `show${capitalize(t)}Panel`,
        () => {
          if (getIndexOfType(options.type) >= getIndexOfType(t)) {
            pickingType.value = t;
            viewDate.value = getInitialViewDate();
          }
        },
      ]),
    ) as Record<`show${Capitalize<DatePanelType>}Panel`, () => void>),
  };

  /** will call handle if cell is found in event path */
  const handleIfCell = (e: Event, handle: (cell: UseDatePanelCell, indexes: [number, number]) => void) => {
    let indexes: [number, number] | undefined, isCell: boolean;
    iterateEventPath(e, (target) => {
      if (isHTMLElement(target) && (indexes = getCell(target))) {
        const [row, col] = indexes;
        const cell = cells.value[row]?.[col];
        if (cell && !cell.state.disabled && !(options.hidePreviewDates && cell.state.preview)) {
          handle(cell, indexes);
          return (isCell = true);
        }
      }
    });
    return isCell!;
  };
  const selectCell = async ({ date }: UseDatePanelCell) => {
    const { type } = options,
      pType = pickingType.value;
    if (pType !== type) {
      const chain = panelTypeChain[type];
      const index = chain.findIndex((t) => t === pType);
      pickingType.value = chain[index + 1];
      viewDate.value = viewStartOf(date);
      return;
    }
    const selectViewStart = viewStartOf(date);
    if (!isSame(selectViewStart, viewDate.value)) {
      direction.value = isBefore(
        date,
        (prevCells.value as UseDatePanelCells).viewStartDate || cells.value.viewStartDate,
      )
        ? (await runIfFn(beforeViewChange, 1), 'down')
        : isAfter(date, (nextCells.value as UseDatePanelCells).viewEndDate || cells.value.viewEndDate)
        ? (await runIfFn(beforeViewChange, -1), 'up')
        : undefined;
      viewDate.value = date;
    }
    const ranges = multiRangeValues.value,
      range = rangeValue.value;
    const { selecting } = state;
    if (ranges) {
      if (selecting) {
        const newRange = formatRangeValue([selecting, date]) as [DateValueType, DateValueType];
        const newRanges = ranges.filter((range) => !isOverlapping(newRange, range));
        newRanges.push(newRange);
        newRanges.sort((r1, r2) => (isBefore(r1[0], r2[0]) ? -1 : 1));
        state.selecting = null;
        runIfFn(onSelect, newRanges, newRanges.map((r) => r.map((d) => format(d))) as [string, string][]);
      } else state.selecting = date;
    } else if (range) {
      const newRange = formatRangeValue([selecting, date]);
      state.selecting = newRange.length
        ? (runIfFn(onSelect, newRange, newRange.map((d) => format(d)) as [string, string]), null)
        : date;
    } else if (options.multiple) {
      const newValues = values.value.filter((v) => !isSame(v, date)); // click selected date will unselect it
      const final = (values.value.length === newValues.length ? [...newValues, date] : newValues).sort((a, b) =>
        isBefore(a, b) ? -1 : 1,
      );
      runIfFn(onSelect, final, final.map((i) => format(i)) as [string, string]);
    } else runIfFn(onSelect, date, format(date));
  };
  const getOffsetDate = (date: DateValueType, e: KeyboardEvent) => {
    const cols = gridMap[getProcessedType()][1];
    const offset = isArrowUpEvent(e)
      ? -cols
      : isArrowDownEvent(e)
      ? cols
      : isArrowLeftEvent(e)
      ? -1
      : isArrowRightEvent(e)
      ? 1
      : 0;
    return [add(date, offset), offset] as const;
  };
  const handlers = {
    onClick(e: MouseEvent) {
      if (!handleIfCell(e, selectCell)) {
        iterateEventPath(e, (t) => {
          if (isHTMLElement(t)) {
            const {
              dataset: { method, disabled },
            } = t;
            if (method && method in methods && !disabled) {
              methods[method as keyof typeof methods]();
            }
          }
        });
      }
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
      handleIfCell(e, async (cell) => {
        const { date } = cell;
        if (isEnterDown(e)) selectCell(cell);
        else if (isArrowUpEvent(e) || isArrowDownEvent(e) || isArrowLeftEvent(e) || isArrowRightEvent(e)) {
          prevent(e);
          const [newDate, offset] = getOffsetDate(date, e);
          if (!isInView(newDate, date)) {
            direction.value = e.key.slice(5).toLowerCase() as any;
            await runIfFn(beforeViewChange, offset);
            viewDate.value = viewStartOf(newDate);
          }
          state.focusing = newDate;
          if (state.selecting) state.hovering = null; // clear hovering if we are selecting a range and then use arrows to move focus, so that we can use focusing as selectingEnd
          nextTick(() => unrefOrGet(getFocusing)?.focus());
        }
      });
    },
    onFocusin(e: FocusEvent) {
      // check isLastPickingType in case of updating focusing when changing picking type by selectCell
      handleIfCell(e, ({ date }) => isLastPickingType() && (state.focusing = date));
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
    direction,
    onTransitionEnd: () => (direction.value = undefined),
    prevCells,
    nextCells,
    expose: {
      parseDate: parse,
      formatDate: format,
      getCellText,
    },
    pickingType,
  };
}
