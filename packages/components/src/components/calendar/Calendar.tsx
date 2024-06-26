import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { calendarEmits, calendarProps } from './type';
import { defineIcon } from '../icon/Icon';
import { useCEExpose, useCEStates, useNamespace, useValueModel } from 'hooks';
import { intl, partsDefine } from 'common';
import { createDateLocaleMethods, createUseModel, useDatePanel, UseDatePanelCells, useSetupEdit } from '@lun/core';
import { capitalize, getRect, pick, raf, runIfFn, supportTouch, virtualGetMerge, withResolvers } from '@lun/utils';
import { useContextConfig } from '../config/config.context';
import { ComputedRef, onMounted, ref, Transition, nextTick, onBeforeUnmount } from 'vue';
import { GlobalStaticConfig } from 'config';

const useViewDate = createUseModel({
  defaultKey: 'viewDate',
  defaultEvent: 'updateViewDate',
});

const name = 'calendar';
export const Calendar = defineSSRCustomElement({
  name,
  props: calendarProps,
  emits: calendarEmits,
  setup(props) {
    const ns = useNamespace(name);
    useSetupEdit();
    const context = useContextConfig();
    const viewDate = useViewDate(props),
      valueModel = useValueModel(props);
    const focusingInner = ref<HTMLElement>(),
      wrapper = ref<HTMLElement>();

    const lang = () => context.lang;
    const getFormat = (field: keyof typeof props, defaultFormat: string) =>
      props[field] || intl(`date.${field}`).d(defaultFormat);

    const scrollable = () => props.scrollable || supportTouch;
    const { cells, methods, direction, handlers, prevCells, nextCells } = useDatePanel(
      virtualGetMerge(
        {
          type: 'date' as const,
          lang,
          value: valueModel,
          viewDate,
          cellFormat: () => getFormat('cellFormat', 'D'),
          getCell({ dataset: { row, col } }: HTMLElement) {
            if (row && col) return [+row, +col] as [number, number];
          },
          onSelect(value: any) {
            valueModel.value = value;
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
                target.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
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

    let scrollEnd: (() => void) | null, observer: IntersectionObserver;
    onMounted(() => {
      const { value } = wrapper;
      let lastScrollLeft: number = 0,
        observing = false;
      const scrollToCenter = () => {
        const { children, scrollLeft } = value!;
        if (scrollLeft !== lastScrollLeft) {
          // this is to check if it's scrolling as our threshold is 0.99 not 1, we must scroll to center after last scroll stops, or it will cause multiple scrolls!!!
          lastScrollLeft = scrollLeft;
          raf(scrollToCenter);
        } else
          raf(() => {
            (children[1] as HTMLElement).scrollIntoView({ behavior: 'instant', block: 'nearest' });
            if (!observing) observe();
          });
      };
      const observe = () => {
        observer.observe(value!.children[0] as HTMLElement);
        observer.observe(value!.children[2] as HTMLElement);
        observing = true;
      };
      if (scrollable()) {
        scrollToCenter();
        observer = new IntersectionObserver(
          (entries) => {
            for (const { intersectionRatio, target, isIntersecting } of entries) {
              if (intersectionRatio > 0.99 && isIntersecting) {
                observer.disconnect();
                observing = false;
                if (scrollEnd) {
                  scrollEnd();
                  scrollEnd = null;
                  nextTick(scrollToCenter);
                } else {
                  // user scrolls
                  if (target === value!.children[0]) methods.prevView();
                  else methods.nextView();
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
    onBeforeUnmount(() => observer.disconnect());

    const {
      type: { get },
    } = GlobalStaticConfig.date;
    const { getShortMonths, getShortWeekDays, getWeekFirstDay, format } = createDateLocaleMethods(lang);

    const [stateClass] = useCEStates(() => pick(props, ['full']), ns);
    useCEExpose(methods);

    const getCellNodes = ({ value }: ComputedRef<UseDatePanelCells>, bodyClass?: string) => (
      <div key={scrollable() ? undefined : value.key} class={[ns.e('body'), bodyClass]} part={partsDefine[name].body}>
        {value.map((row, rowIndex) => {
          return row.map(({ text, state }, colIndex) => {
            return (
              <div
                data-row={rowIndex}
                data-col={colIndex}
                class={[ns.e('cell'), ns.em('cell', 'body'), ns.is(state)]}
                part={partsDefine[name].cell}
              >
                <div
                  class={ns.e('inner')}
                  part={partsDefine[name].inner}
                  tabindex={state.now || state.selected ? 0 : -1}
                  ref={state.focusing && state.inView ? focusingInner : undefined}
                >
                  {text}
                </div>
              </div>
            );
          });
        })}
      </div>
    );

    return () => {
      let { shortMonths, shortWeekDays, monthBeforeYear } = props;
      shortMonths ||= runIfFn(getShortMonths) || [];
      shortWeekDays ||= runIfFn(getShortWeekDays) || [];
      const weekFirstDay = getWeekFirstDay(),
        view = viewDate.value,
        monthFormat = getFormat('monthFormat', '');
      const yearMonth = [
        <button class={[ns.e('year'), ns.e('info-btn')]}>{format(view, getFormat('yearFormat', 'YYYY'))}</button>,
        <button class={[ns.e('month'), ns.e('info-btn')]}>
          {monthFormat ? format(view, monthFormat) : shortMonths[get('M', view)]}
        </button>,
      ];
      const row0 = cells.value[0] || [];
      return (
        <div {...handlers} class={stateClass.value} part={partsDefine[name].root}>
          <slot name="header">
            <div class={ns.e('header')} part={partsDefine[name].header}>
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
          <div class={ns.e('content')} part={partsDefine[name].content} style={ns.v({ cols: row0.length })}>
            <div class={ns.e('head')} part={partsDefine[name].head}>
              {row0.map((_, i) => {
                return (
                  <div class={[ns.e('cell'), ns.em('cell', 'head')]} part={partsDefine[name].cell}>
                    <div class={ns.e('inner')} part={partsDefine[name].inner}>
                      {shortWeekDays[(i + weekFirstDay) % 7]}
                    </div>
                  </div>
                );
              })}
            </div>
            {scrollable() ? (
              <div class={ns.e('wrapper')} ref={wrapper} part={partsDefine[name].wrapper}>
                {getCellNodes(prevCells as ComputedRef<UseDatePanelCells>, ns.em('body', 'prev'))}
                {getCellNodes(cells, ns.em('body', 'current'))}
                {getCellNodes(nextCells as ComputedRef<UseDatePanelCells>, ns.em('body', 'next'))}
              </div>
            ) : (
              <Transition name={direction.value ? 'slide' + capitalize(direction.value) : ''}>
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
export type iCalendar = InstanceType<tCalendar>;

export const defineCalendar = createDefineElement(name, Calendar, {
  icon: defineIcon,
});
