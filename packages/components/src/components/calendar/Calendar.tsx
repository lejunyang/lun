import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { calendarEmits, calendarProps } from './type';
import { defineIcon } from '../icon/Icon';
import { useNamespace } from 'hooks';
import { getTransitionProps, intl } from 'common';
import { createDateLocaleMethods, createUseModel, useDatePanel } from '@lun/core';
import { runIfFn, virtualGetMerge } from '@lun/utils';
import { useContextConfig } from '../config/config.context';
import { TransitionGroup } from 'vue';
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
    const context = useContextConfig();
    const viewDate = useViewDate(props);

    const lang = () => context.lang;
    const getFormat = (field: keyof typeof props, defaultFormat: string) =>
      props[field] || intl(`date.${field}`).d(defaultFormat);
    const { cells, methods } = useDatePanel(
      virtualGetMerge(
        {
          type: 'date' as const,
          lang,
          viewDate,
          cellFormat: () => getFormat('cellFormat', 'D'),
        },
        props,
      ),
    );
    const { getMonth } = GlobalStaticConfig.date;
    const { getShortMonths, getShortWeekDays, getWeekFirstDay, format } = createDateLocaleMethods(lang);
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
        <div>
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
          <table class={ns.e('body')}>
            <thead>
              {cells.value[0].map((_, i) => {
                return <th>{shortWeekDays[(i + weekFirstDay) % 7]}</th>;
              })}
            </thead>
            <tbody>
              <TransitionGroup {...getTransitionProps(props)}>
                {cells.value.map((row) => {
                  return (
                    // add key to trigger transition on view changing
                    <tr key={row.key}>
                      {row.map(({ text }) => {
                        return <td>{text}</td>;
                      })}
                    </tr>
                  );
                })}
              </TransitionGroup>
            </tbody>
          </table>
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
