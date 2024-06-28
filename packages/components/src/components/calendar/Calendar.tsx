import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { calendarEmits, calendarProps } from './type';
import { defineIcon } from '../icon/Icon';
import { useCEStates, useNamespace, useValueModel } from 'hooks';
import { intl, partsDefine } from 'common';
import { createDateLocaleMethods, createUseModel, useDatePanel, UseDatePanelCells, useSetupEdit } from '@lun/core';
import { capitalize, runIfFn, supportTouch, virtualGetMerge } from '@lun/utils';
import { useContextConfig } from '../config/config.context';
import { ComputedRef, onMounted, ref, Transition, watchEffect } from 'vue';
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

    const scrollable = () => props.scrollable || supportTouch || true;
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
        },
        props,
      ),
    );

    const {
      type: { get },
    } = GlobalStaticConfig.date;
    const { getShortMonths, getShortWeekDays, getWeekFirstDay, format } = createDateLocaleMethods(lang);

    const [stateClass] = useCEStates(() => null, ns);

    const getCellNodes = ({ value }: ComputedRef<UseDatePanelCells>, bodyClass?: string) => (
      <div key={value.key} class={[ns.e('body'), bodyClass]} part={partsDefine[name].body}>
        {value.map((row, rowIndex) => {
          return row.map(({ text, state }, colIndex) => {
            return (
              <div
                data-row={rowIndex}
                data-col={colIndex}
                class={[ns.is(state), ns.e('cell'), ns.em('cell', 'body')]}
                part={partsDefine[name].cell}
              >
                <div
                  class={ns.e('inner')}
                  part={partsDefine[name].inner}
                  tabindex={state.now || state.selected ? 0 : -1}
                  ref={state.focusing ? focusingInner : undefined}
                >
                  {text}
                </div>
              </div>
            );
          });
        })}
      </div>
    );

    onMounted(() => {
      const { value } = wrapper;
      value!.scrollLeft = (value!.children[0] as HTMLElement).clientWidth;
    });
    watchEffect(
      () => {
        const { value } = wrapper;
        if (!scrollable() || !value) return;
      },
      { flush: 'sync' },
    );

    return () => {
      let { shortMonths, shortWeekDays, monthBeforeYear } = props;
      shortMonths ||= runIfFn(getShortMonths) || [];
      shortWeekDays ||= runIfFn(getShortWeekDays) || [];
      const weekFirstDay = getWeekFirstDay(),
        view = viewDate.value,
        monthFormat = getFormat('monthFormat', '');
      const yearMonth = [
        <button>{format(view, getFormat('yearFormat', 'YYYY'))}</button>,
        <button>{monthFormat ? format(view, monthFormat) : shortMonths[get('M', view)]}</button>,
      ];
      const row0 = cells.value[0] || [];
      return (
        <div {...handlers} class={stateClass.value} part={partsDefine[name].root}>
          <slot name="header"></slot>
          <div>
            <slot name="super-prev" onClick={methods.prevYear}>
              <button>{renderElement('icon', { name: 'double-left' })}</button>
            </slot>
            <slot name="prev" onClick={methods.prevMonth}>
              <button>{renderElement('icon', { name: 'down' })}</button>
            </slot>
            <div>{monthBeforeYear ? yearMonth.reverse() : yearMonth}</div>
            <slot name="next" onClick={methods.nextMonth}>
              <button>{renderElement('icon', { name: 'down' })}</button>
            </slot>
            <slot name="super-next" onClick={methods.nextYear}>
              <button>{renderElement('icon', { name: 'double-left' })}</button>
            </slot>
          </div>
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
