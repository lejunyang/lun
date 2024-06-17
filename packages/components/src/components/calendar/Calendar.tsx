import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { calendarEmits, calendarProps } from './type';
import { defineIcon } from '../icon/Icon';
import { Transition, ref } from 'vue';
import { useCEExpose, useNamespace } from 'hooks';
import { getTransitionProps, intl } from 'common';
import { useDatePanel } from '@lun/core';
import { virtualGetMerge } from '@lun/utils';
import { useContextConfig } from '../config/config.context';
import { GlobalStaticConfig } from 'config';

const name = 'calendar';
export const Calendar = defineSSRCustomElement({
  name,
  props: calendarProps,
  emits: calendarEmits,
  setup(props) {
    const ns = useNamespace(name);
    const context = useContextConfig();

    const { cells } = useDatePanel(
      virtualGetMerge(
        {
          type: 'date' as const,
          lang: () => context.lang,
          cellFormat: () => {
            return props.cellFormat || intl('date.cellFormat').d('D');
          },
        },
        props,
      ),
    );
    const {
      getDate,
      locale: { format },
    } = GlobalStaticConfig.date;
    return () => {
      return (
        <table>
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
      );
    };
  },
});

export type tCalendar = typeof Calendar;
export type iCalendar = InstanceType<tCalendar>;

export const defineCalendar = createDefineElement(name, Calendar, {
  icon: defineIcon,
});
