import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { datePickerEmits, datePickerProps } from './type';
import { CalendarUpdateDetail, defineCalendar } from '../calendar';
import { defineInput } from '../input';
import { definePopover } from '../popover';
import { DateValueType, useSetupEdit, useSetupEvent } from '@lun/core';
import { useCEStates, useNamespace, useValueModel, useViewDate } from 'hooks';
import { ref } from 'vue';

const name = 'date-picker';
export const DatePicker = defineSSRCustomElement({
  name,
  formAssociated: true,
  props: datePickerProps,
  emits: datePickerEmits,
  setup(props, { emit: e }) {
    const ns = useNamespace(name);
    const emit = useSetupEvent<typeof e>();
    useSetupEdit();
    const viewDate = useViewDate(props),
      valueModel = useValueModel(props, { shouldEmit: false }),
      inputModel = ref();
    const calendarHandlers = {
      onUpdate({ detail }: CustomEvent<CalendarUpdateDetail>) {
        inputModel.value = valueModel.value = detail.value;
        emit('update', detail);
      },
      onUpdateViewDate({ detail }: CustomEvent<DateValueType>) {
        viewDate.value = detail;
      },
    };

    const [stateClass] = useCEStates(() => null, ns);
    return () => {
      const { popoverProps, inputProps, multiple, ...rest } = props;
      return renderElement('popover', {
        placement: 'bottom-start',
        ...popoverProps,
        class: stateClass.value,
        showArrow: false,
        triggers: ['click', 'focus'],
        defaultChildren: renderElement('input', { ...inputProps, value: inputModel.value, multiple }),
        contentType: 'vnode',
        content: renderElement('calendar', {
          ...rest,
          value: valueModel.value,
          viewDate: viewDate.value,
          ...calendarHandlers,
        }),
      });
    };
  },
});

export type tDatePicker = typeof DatePicker;
export type iDatePicker = InstanceType<tDatePicker>;

export const defineDatePicker = createDefineElement(name, DatePicker, {
  input: defineInput,
  popover: definePopover,
  calendar: defineCalendar,
});
