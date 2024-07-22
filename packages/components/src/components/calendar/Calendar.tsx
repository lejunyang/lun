import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement, scrollIntoView } from 'utils';
import { calendarEmits, calendarProps } from './type';
import { defineIcon } from '../icon/Icon';
import { useCEExpose, useCEStates, useNamespace, useValueModel, useViewDate } from 'hooks';
import { getCompParts, intl } from 'common';
import {
  createDateLocaleMethods,
  DateValueType,
  useDatePanel,
  UseDatePanelCells,
  useSetupEdit,
  useSetupEvent,
} from '@lun/core';
import {
  AnyAsyncFn,
  capitalize,
  getRect,
  raf,
  runIfFn,
  supportTouch,
  toGetterDescriptors,
  virtualGetMerge,
  withResolvers,
} from '@lun/utils';
import { useContextConfig } from '../config/config.context';
import { ComputedRef, onMounted, ref, Transition, nextTick, onBeforeUnmount } from 'vue';

const name = 'calendar';
const parts = ['root', 'content', 'head', 'body', 'cell', 'inner', 'wrapper', 'header'] as const;
const compParts = getCompParts(name, parts);

const panelTypes = ['date', 'week', 'month', 'quarter', 'year'] as const;
export const Calendar = defineSSRCustomElement({
  name,
  props: calendarProps,
  emits: calendarEmits,
  setup(props, { emit: e }) {
    const ns = useNamespace(name);
    const emit = useSetupEvent<typeof e>();
    useSetupEdit();
    const context = useContextConfig();
    const viewDate = useViewDate(props),
      valueModel = useValueModel(props, { shouldEmit: false });
    const focusingInner = ref<HTMLElement>(),
      wrapper = ref<HTMLElement>();

    const lang = () => context.lang;
    const getFormat = (field: keyof typeof props) => props[field] || intl(`date.${field}`).d(''); // must add .d('') or it would be String object and always be truthy

    const scrollable = () => props.scrollable || supportTouch;
    const { cells, methods, direction, onTransitionEnd, handlers, prevCells, nextCells, state, expose, pickingType } =
      useDatePanel(
        virtualGetMerge(
          {
            get type() {
              return props.type || 'date';
            },
            lang,
            value: valueModel,
            viewDate,
            ...(Object.fromEntries(panelTypes.map((t) => [`${t}Format`, () => getFormat(`${t}Format`)])) as Record<
              'dateFormat' | 'weekFormat' | 'monthFormat' | 'quarterFormat' | 'yearFormat',
              () => string
            >),
            getCell({ dataset: { row, col } }: HTMLElement) {
              if (row && col) return [+row, +col] as [number, number];
            },
            onSelect(value: any, valueStr: any) {
              valueModel.value = valueStr;
              emit('update', {
                value: valueStr,
                raw: value,
              });
            },
            getFocusing: focusingInner,
            enablePrevCells: scrollable,
            enableNextCells: scrollable,
            async beforeViewChange(offset: number) {
              if (scrollable()) {
                // >> 31 => positive: 0 negative: -1
                const { value } = wrapper;
                const target = value!.children[1 + ((offset >> 31) | 1)] as HTMLElement;
                const { x, width } = getRect(target),
                  { x: wx } = getRect(value!);
                if (Math.abs(x - wx) > width / 2) {
                  scrollIntoView(target, {
                    behavior: 'smooth',
                  });
                  const { promise, resolve } = withResolvers();
                  scrollEnd = resolve;
                  return promise;
                }
              }
            },
          },
          props,
        ),
      );

    let scrollEnd: (() => void) | null, observer: IntersectionObserver | undefined;
    onMounted(() => {
      const { value } = wrapper;
      let lastScrollLeft: number = 0,
        observing = false,
        onBeforeCenter: AnyAsyncFn | null;
      const scrollToCenter = () => {
        const { children, scrollLeft } = value!;
        if (scrollLeft !== lastScrollLeft) {
          // this is to check if it's scrolling as our threshold is 0.99 not 1, we must scroll to center after last scroll stops, or it will cause multiple scrolls!!!
          lastScrollLeft = scrollLeft;
          raf(scrollToCenter);
        } else
          raf(async () => {
            if (onBeforeCenter) {
              await onBeforeCenter();
              onBeforeCenter = null;
            }
            scrollIntoView(children[1] as HTMLElement, { behavior: 'instant' });
            if (!observing) observe();
          });
      };
      const observe = () => {
        observer!.observe(value!.children[0] as HTMLElement);
        observer!.observe(value!.children[2] as HTMLElement);
        observing = true;
      };
      if (scrollable()) {
        scrollToCenter();
        observer = new IntersectionObserver(
          (entries) => {
            for (const { intersectionRatio, target, isIntersecting } of entries) {
              if (intersectionRatio > 0.99 && isIntersecting) {
                observer!.disconnect();
                observing = false;
                if (scrollEnd) {
                  scrollEnd();
                  scrollEnd = null;
                  nextTick(scrollToCenter);
                } else {
                  // user scrolls
                  focusingInner.value?.blur(); // need to clear previous focus to fix the issue(arrow left to navigate to left month, then scroll to right, focusing element will be wrong)
                  state.focusing = null;
                  onBeforeCenter = async () => {
                    if (target === value!.children[0]) methods.prevView();
                    else methods.nextView();
                    await nextTick();
                  };
                  raf(scrollToCenter);
                }
              }
              return; // threshold is 0.99, it may have multiple entries, only process the first entry
            }
          },
          {
            root: value!,
            threshold: 0.99, // use 1 will cause bugs! sometimes it doesn't trigger IntersectionObserver's callback when using 1
          },
        );
        observe();
      }
    });
    onBeforeUnmount(() => observer?.disconnect());

    const { getShortWeekDays, getWeekFirstDay } = createDateLocaleMethods(lang);

    const [stateClass] = useCEStates(() => ({ [pickingType.value]: 1 }), ns);
    useCEExpose({ ...methods, ...expose }, toGetterDescriptors(state));

    const getCellNodes = ({ value }: ComputedRef<UseDatePanelCells>, bodyClass?: string) => {
      const { hidePreviewDates, removePreviewRow } = props;
      return (
        <div key={scrollable() ? undefined : value.key} class={[ns.e('body'), bodyClass]} part={compParts[3]}>
          {value.map((row, rowIndex) => {
            if ((removePreviewRow || hidePreviewDates) && row.allPreviewDates) return null;
            return row.map(({ text, state }, colIndex) => {
              return (
                <div
                  data-row={rowIndex}
                  data-col={colIndex}
                  class={[ns.e('cell'), ns.em('cell', 'body'), ns.is(state)]}
                  part={compParts[4]}
                >
                  {hidePreviewDates && state.preview ? null : (
                    <div
                      class={ns.e('inner')}
                      part={compParts[5]}
                      tabindex={state.now || state.selected ? 0 : -1}
                      ref={state.focusing && state.inView ? focusingInner : undefined}
                    >
                      {text}
                    </div>
                  )}
                </div>
              );
            });
          })}
        </div>
      );
    };

    return () => {
      let { shortWeekDays, monthBeforeYear, mini } = props;
      shortWeekDays ||= runIfFn(getShortWeekDays) || [];
      const weekFirstDay = getWeekFirstDay(),
        view = viewDate.value;
      const yearMonth = [
        <button class={[ns.e('year'), ns.e('info-btn')]} data-method="showYearPanel">
          {expose.getCellText(view, 'year')}
        </button>,
        <button class={[ns.e('month'), ns.e('info-btn')]} data-method="showMonthPanel">
          {expose.getCellText(view, 'month')}
        </button>,
      ];
      const row0 = cells.value[0] || [];
      return (
        <div {...handlers} class={[stateClass.value, ns.m(mini ? 'mini' : 'full')]} part={compParts[0]}>
          <slot name="header">
            <div class={ns.e('header')} part={compParts[7]}>
              <button class={ns.e('super-prev')} data-method="prevYear">
                {renderElement('icon', { name: 'double-left' })}
              </button>
              <button class={ns.e('super-prev')} data-method="prevMonth">
                {renderElement('icon', { name: 'left' })}
              </button>
              <div class={ns.e('info')}>{monthBeforeYear ? yearMonth.reverse() : yearMonth}</div>
              <button class={ns.e('next')} data-method="nextMonth">
                {renderElement('icon', { name: 'right' })}
              </button>
              <button class={ns.e('super-next')} data-method="nextYear">
                {renderElement('icon', { name: 'double-right' })}
              </button>
            </div>
          </slot>
          <div class={ns.e('content')} part={compParts[1]} style={ns.v({ cols: row0.length })}>
            {pickingType.value === 'date' && (
              <div class={ns.e('head')} part={compParts[2]}>
                {row0.map((_, i) => {
                  return (
                    <div class={[ns.e('cell'), ns.em('cell', 'head')]} part={compParts[4]}>
                      <div class={ns.e('inner')} part={compParts[5]}>
                        {shortWeekDays[(i + weekFirstDay) % 7]}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {scrollable() ? (
              <div class={ns.e('wrapper')} ref={wrapper} part={compParts[6]}>
                {getCellNodes(prevCells as ComputedRef<UseDatePanelCells>, ns.em('body', 'prev'))}
                {getCellNodes(cells, ns.em('body', 'current'))}
                {getCellNodes(nextCells as ComputedRef<UseDatePanelCells>, ns.em('body', 'next'))}
              </div>
            ) : (
              <Transition
                name={direction.value ? 'slide' + capitalize(direction.value) : 'date'}
                onAfterEnter={onTransitionEnd}
              >
                {getCellNodes(cells)}
              </Transition>
            )}
          </div>
          <slot name="footer"></slot>
        </div>
      );
    };
  },
});

export type tCalendar = typeof Calendar;
export type CalendarExpose = Readonly<{
  selecting: null | DateValueType;
  hovering: null | DateValueType;
  focusing: null | DateValueType;
  parseDate(value: any): DateValueType | null;
  formatDate(value: DateValueType): string;
}>;
export type iCalendar = InstanceType<tCalendar> & CalendarExpose;

export const defineCalendar = createDefineElement(name, Calendar, {}, parts, {
  icon: defineIcon,
});
