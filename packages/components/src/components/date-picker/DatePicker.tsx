import { defineCustomElement } from 'custom';
import { closePopover, createDefineElement, renderElement } from 'utils';
import { datePickerEmits, datePickerProps } from './type';
import { defineCalendar, iCalendar } from '../calendar';
import { defineInput, iInput } from '../input';
import { definePopover, iPopover } from '../popover';
import { useDateParseFormat, useSetupEdit, useSetupEvent } from '@lun-web/core';
import { createGetterForHasRawModel, useCEStates, useNamespace, useValueModel, useViewDate } from 'hooks';
import { ref } from 'vue';
import { extend, isObject } from '@lun-web/utils';
import { useContextConfig } from 'config';
import { ElementWithExpose } from 'common';

const name = 'date-picker';
const parts = [] as const;
export const DatePicker = defineCustomElement({
  name,
  formAssociated: true,
  props: datePickerProps,
  emits: datePickerEmits,
  setup(props, { emit: e }) {
    useNamespace(name);
    const context = useContextConfig();
    const { parse, format } = useDateParseFormat(extend(props, { lang: () => context.lang }));

    useSetupEdit();
    const emit = useSetupEvent<typeof e>(
      {
        update(val) {
          if (isObject(val) && 'raw' in val) {
            // it's calendar's update
            valueModel.value = val;
            inputModel.value = val.value;
            if (!props.multiple) closePopover(popoverRef, true, true);
          } else {
            // it's input's update
            const newDate = parse(val);
            if (newDate) {
              valueModel.value = {
                value: newDate,
              };
              emit('update', {
                raw: newDate,
                value: (inputModel.value = format(newDate)), // TODO multiple
              });
            }
          }
        },
        updateViewDate(val) {
          viewDate.value = val;
        },
        close() {
          // popover closes, reset input's internal value to clear invalid input
          inputRef.value?.resetValue();
        },
      },
      { forceChildrenBubble: true },
    );

    const viewDate = useViewDate(props),
      valueModel = useValueModel(props, { hasRaw: true }),
      inputModel = ref(format(parse(valueModel.value.value)!) || undefined); // TODO multiple. consider moving multiple and range to useDateParseFormat
    const popoverRef = ref<iPopover>(),
      calendarRef = ref<iCalendar>(),
      inputRef = ref<iInput>();

    const getValue = createGetterForHasRawModel(valueModel);

    const [stateClass] = useCEStates(() => null);
    // TODO expose
    return () => {
      const { popoverProps, inputProps, multiple, ...rest } = props;
      return renderElement('popover', {
        placement: 'bottom-start',
        ...popoverProps,
        class: stateClass.value,
        showArrow: false,
        ref: popoverRef,
        triggers: ['click', 'focus'],
        defaultChildren: renderElement('input', {
          ...inputProps,
          value: inputModel.value,
          multiple,
          ref: inputRef,
        }),
        content: renderElement('calendar', {
          ...rest,
          ref: calendarRef,
          value: getValue(),
          viewDate: viewDate.value,
        }),
      });
    };
  },
});

export type DatePickerExpose = {};
export type tDatePicker = ElementWithExpose<typeof DatePicker, DatePickerExpose>;
export type iDatePicker = InstanceType<tDatePicker>;

export const defineDatePicker = createDefineElement(name, DatePicker, {}, parts, [
  defineInput,
  definePopover,
  defineCalendar,
]);
