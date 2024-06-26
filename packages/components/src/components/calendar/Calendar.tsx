import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { calendarEmits, calendarProps } from './type';
import { defineIcon } from '../icon/Icon';
import { useCEStates, useNamespace, useValueModel } from 'hooks';
import { intl, partsDefine } from 'common';
import { createDateLocaleMethods, createUseModel, useDatePanel, useSetupEdit } from '@lun/core';
import { capitalize, runIfFn, virtualGetMerge } from '@lun/utils';
import { useContextConfig } from '../config/config.context';
import { ref, Transition } from 'vue';
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
    const focusingInner = ref<HTMLElement>();

    const lang = () => context.lang;
    const getFormat = (field: keyof typeof props, defaultFormat: string) =>
      props[field] || intl(`date.${field}`).d(defaultFormat);

    const { cells, methods, getBaseDateStr, direction, handlers } = useDatePanel(
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
        },
        props,
      ),
    );

    const { getMonth } = GlobalStaticConfig.date;
    const { getShortMonths, getShortWeekDays, getWeekFirstDay, format } = createDateLocaleMethods(lang);

    const [stateClass] = useCEStates(() => null, ns);

    return () => {
      let { shortMonths, shortWeekDays, monthBeforeYear } = props;
      shortMonths ||= runIfFn(getShortMonths) || [];
      shortWeekDays ||= runIfFn(getShortWeekDays) || [];
      const weekFirstDay = getWeekFirstDay(),
        view = viewDate.value,
        monthFormat = getFormat('monthFormat', '');
      const yearMonth = [
        <button>{format(view, getFormat('yearFormat', 'YYYY'))}</button>,
        <button>{monthFormat ? format(view, monthFormat) : shortMonths[getMonth(view)]}</button>,
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
                  <div class={[ns.em('cell', 'head'), ns.e('cell')]} part={partsDefine[name].cell}>
                    {shortWeekDays[(i + weekFirstDay) % 7]}
                  </div>
                );
              })}
            </div>
            <Transition name={direction.value ? 'slide' + capitalize(direction.value) : ''}>
              <div key={getBaseDateStr()} class={ns.e('body')} part={partsDefine[name].body}>
                {cells.value.map((row, rowIndex) => {
                  return row.map(({ text, state }, colIndex) => {
                    return (
                      <div
                        data-row={rowIndex}
                        data-col={colIndex}
                        class={[ns.is(state), ns.em('cell', 'body'), ns.e('cell')]}
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
            </Transition>
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
