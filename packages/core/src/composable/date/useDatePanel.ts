import { computed, nextTick, reactive, ref, Ref, WritableComputedRef } from 'vue';
import {
  BaseDateType,
  createDateLocaleMethods,
  createDateTypeMethods,
  DatePanelType,
  DateValueType,
  ExtendBaseDateType,
  presets,
} from '../../presets';
import { MaybeRefLikeOrGetter, ToAllMaybeRefLike, unrefOrGet } from '../../utils';
import {
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
  toArrayIfNotNil,
} from '@lun/utils';
import { getDefaultFormat } from './utils';
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
export type UseDatePanelCells = (UseDatePanelCell[] & { key: string })[] & {
  key: string;
  viewStartDate: DateValueType;
  viewEndDate: DateValueType;
};

export type UseDatePanelOptions = ToAllMaybeRefLike<
  {
    lang: string;
    cellFormat: string;
    getFocusing: HTMLElement;
    enablePrevCells?: boolean;
    enableNextCells?: boolean;
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
  getCell: (target: HTMLElement) => [number, number] | undefined;
  onSelect?: (value: DateValueType | [DateValueType, DateValueType] | [DateValueType, DateValueType][]) => void;
  beforeViewChange?: (offset: number) => Promise<void> | void;
  // titleFormat?:
};

/** [rows, cols] */
const gridMap = {
  date: [6, 7],
} as Record<DatePanelType, [number, number]>;
/** date offset for each panel type */
const panelOffsetMap = {
  de: ['y', 100],
  y: ['y', 10],
  Q: ['y', 1],
  M: ['y', 1],
  w: ['M', 1],
  d: ['M', 1],
} as Record<BaseDateType | ExtendBaseDateType, [BaseDateType, number]>;

export function useDatePanel(options: UseDatePanelOptions) {
  if (!presets.date)
    throw new Error(__DEV__ ? 'Must set date preset methods before using Date related components' : '');
  const {
    lang,
    cellFormat,
    viewDate,
    getCell,
    onSelect,
    getFocusing,
    enablePrevCells,
    enableNextCells,
    beforeViewChange,
  } = options;

  // --------- Methods ----------
  const {
    getWeekDay,
    getNow,
    isBefore,
    isAfter,
    isValid,
    type: { get, add: typeAdd, endOf, startOf },
  } = presets.date;
  const { getWeekFirstDay, parse, format } = createDateLocaleMethods(lang);
  const { isSame, add, set } = createDateTypeMethods(() => options.type);
  const finalParse = (value: any) => (isValid(value) ? value : parse(value, parseFormat.value));

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
    const start = finalParse(value[0] as any);
    const end = finalParse(value[1] as any);
    if (start && end) return isBefore(start, end) ? [start, end] : [end, start];
    else return [];
  };
  const getPanelOffset = () => panelOffsetMap[processType(options.type)];
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
    return isSame(viewStartOf(viewDate), viewStartOf(target));
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

  const getCells = (viewDate: DateValueType) => {
    const viewStartDate = viewStartOf(viewDate),
      viewEndDate = viewEndOf(viewDate),
      panelStartDate = panelStartOf(viewStartDate);
    const { type, disabledDate } = options;
    const grid = gridMap[type];
    const [rows, cols] = grid;
    const now = getNow();
    const { selecting, hovering, focusing } = state;
    const panelStartDateStr = format(panelStartDate, parseFormat.value);
    const cellInfo: UseDatePanelCells = Object.assign([], { key: panelStartDateStr, viewStartDate, viewEndDate });
    for (let row = 0; row < rows; row++) {
      // @ts-ignore
      cellInfo[row] ||= [];
      let rowKey: string;
      for (let col = 0; col < cols; col++) {
        const offset = row * cols + col;
        const currentDate = add(panelStartDate, offset);
        if (!col) rowKey = cellInfo[row].key = panelStartDateStr + '-' + row;
        const disabled = runIfFn(disabledDate, currentDate, { type, selecting }) || !!isOutOfLimit.value(currentDate);
        cellInfo[row][col] = {
          key: rowKey! + '-' + col,
          date: currentDate,
          state: {
            disabled,
            hovered: isSame(hovering, currentDate),
            inView: isInView(currentDate, viewStartDate),
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
  };

  const getViewDate = () => unrefOrGet(viewDate) || viewStartOf(getNow());
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
    viewDate.value = typeAdd(type ?? t, viewDate.value, (offset ?? _offset) * (next ? 1 : -1));
    direction.value = next ? 'right' : 'left';
  };
  const methods = {
    nextMonth: createMethod(true, 'M', 1),
    prevMonth: createMethod(false, 'M', -1),
    nextYear: createMethod(true, 'y', 1),
    prevYear: createMethod(false, 'y', -1),
    nextView: createMethod(true),
    prevView: createMethod(false),
  };

  /** will call handle if cell is found in event path */
  const handleIfCell = (e: Event, handle: (cell: UseDatePanelCell, indexes: [number, number]) => void) => {
    let indexes: [number, number] | undefined, isCell: boolean;
    iterateEventPath(e, (target) => {
      if (isHTMLElement(target) && (indexes = getCell(target))) {
        const [row, col] = indexes;
        const cell = cells.value[row]?.[col];
        if (cell && !cell.state.disabled) {
          handle(cell, indexes);
          return (isCell = true);
        }
      }
    });
    return isCell!;
  };
  const selectCell = async ({ date }: UseDatePanelCell) => {
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
    direction,
    prevCells,
    nextCells,
  };
}
