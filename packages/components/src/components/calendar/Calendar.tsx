import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { calendarEmits, calendarProps } from './type';
import { defineIcon } from '../icon/Icon';
import { useNamespace } from 'hooks';
import { intl } from 'common';
import { createDateLocaleMethods, createUseModel, useDatePanel } from '@lun/core';
import { runIfFn, virtualGetMerge } from '@lun/utils';
import { useContextConfig } from '../config/config.context';

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
    const { cells } = useDatePanel(
      virtualGetMerge(
        {
          type: 'date' as const,
          lang,
          viewDate,
          cellFormat: () => {
            return props.cellFormat || intl('date.cellFormat').d('D');
          },
        },
        props,
      ),
    );
    const { getShortWeekDays, getWeekFirstDay } = createDateLocaleMethods(lang);
    return () => {
      let { shortWeekDays } = props;
      shortWeekDays ||= runIfFn(getShortWeekDays) || [];
      const weekFirstDay = getWeekFirstDay();

      return (
        <div>
          <table class={ns.e('body')}>
            <thead>
              {cells.value[0].map((_, i) => {
                return <th>{shortWeekDays[(i + weekFirstDay) % 7]}</th>;
              })}
            </thead>
            <tbody>
              {cells.value.map((row) => {
                return (
                  <tr>
                    {row.map(({ text }) => {
                      return <td>{text}</td>;
                    })}
                  </tr>
                );
              })}
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
