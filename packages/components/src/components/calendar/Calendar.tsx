import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { calendarEmits, calendarProps } from './type';
import { defineIcon } from '../icon/Icon';
import { useCEStates, useNamespace, useValueModel } from 'hooks';
import { intl, partsDefine } from 'common';
import { createDateLocaleMethods, createUseModel, useDatePanel, useSetupEdit } from '@lun/core';
import { capitalize, runIfFn, virtualGetMerge } from '@lun/utils';
import { useContextConfig } from '../config/config.context';
import { Transition } from 'vue';
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
    const viewDate = useViewDate(props);
    const valueModel = useValueModel(props);

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
        },
        props,
      ),
    );
    const { getMonth } = GlobalStaticConfig.date;
    const { getShortMonths, getShortWeekDays, getWeekFirstDay, format } = createDateLocaleMethods(lang);

    const transitionHandlers = {
      onBeforeLeave: (el: Element) => {
        (el as HTMLElement).style.position = 'absolute'; // make leaving tbody position absolute, so it won't occupy any space
      },
    };

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
          <table class={ns.e('table')} part={partsDefine[name].table}>
            <thead class={ns.e('thead')} part={partsDefine[name].thead}>
              {cells.value[0].map((_, i) => {
                return (
                  <th class={[ns.e('th'), ns.e('cell')]} part={partsDefine[name].th}>
                    {shortWeekDays[(i + weekFirstDay) % 7]}
                  </th>
                );
              })}
            </thead>
            <Transition name={direction.value ? 'slide' + capitalize(direction.value) : ''} {...transitionHandlers}>
              <tbody key={getBaseDateStr()} class={ns.e('tbody')} part={partsDefine[name].tbody}>
                {cells.value.map((row, rowIndex) => {
                  return (
                    <tr data-row={rowIndex} class={ns.e('tr')} part={partsDefine[name].tr}>
                      {row.map(({ text, state }, colIndex) => {
                        return (
                          <td
                            data-row={rowIndex}
                            data-col={colIndex}
                            class={[ns.is(state), ns.e('td'), ns.e('cell')]}
                            part={partsDefine[name].td}
                          >
                            <div
                              class={ns.e('inner')}
                              part={partsDefine[name].inner}
                              tabindex={state.now || state.selected ? 0 : undefined}
                            >
                              {text}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </Transition>
          </table>
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
