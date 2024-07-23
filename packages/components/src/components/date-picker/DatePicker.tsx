import { defineSSRCustomElement } from 'custom';
import { closePopover, createDefineElement, renderElement } from 'utils';
import { datePickerEmits, datePickerProps } from './type';
import { defineCalendar, iCalendar } from '../calendar';
import { defineInput, iInput } from '../input';
import { definePopover, iPopover } from '../popover';
import { useDateParseFormat, useSetupEdit, useSetupEvent } from '@lun/core';
import { useCEStates, useNamespace, useValueModel, useViewDate } from 'hooks';
import { ref } from 'vue';
import { isObject, virtualGetMerge } from '@lun/utils';
import { useContextConfig } from 'config';

const name = 'date-picker';
const parts = [] as const;
export const DatePicker = defineSSRCustomElement({
  name,
  formAssociated: true,
  props: datePickerProps,
  emits: datePickerEmits,
  setup(props, { emit: e }) {
    const ns = useNamespace(name);
    const context = useContextConfig();
    const { parse, format } = useDateParseFormat(virtualGetMerge({ lang: () => context.lang }, props));

    useSetupEdit();
    const emit = useSetupEvent<typeof e>(
      {
        update(val) {
          if (isObject(val) && 'raw' in val) {
            // it's calendar's update
            inputModel.value = valueModel.value = val.value;
            emit('update', val);
            if (!props.multiple) closePopover(popoverRef, true, true);
          } else {
            // it's input's update
            const newDate = parse(val);
            if (newDate) {
              valueModel.value = newDate;
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
      valueModel = useValueModel(props, { shouldEmit: false }),
      inputModel = ref(format(parse(valueModel.value)) || undefined); // TODO multiple. consider moving multiple and range to useDateParseFormat
    const popoverRef = ref<iPopover>(),
      calendarRef = ref<iCalendar>(),
      inputRef = ref<iInput>();

    const [stateClass] = useCEStates(() => null, ns);
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
        contentType: 'vnode',
        content: renderElement('calendar', {
          ...rest,
          ref: calendarRef,
          value: valueModel.value,
          viewDate: viewDate.value,
        }),
      });
    };
  },
});

export type tDatePicker = typeof DatePicker;
export type iDatePicker = InstanceType<tDatePicker>;

export const defineDatePicker = createDefineElement(name, DatePicker, {}, parts, {
  input: defineInput,
  popover: definePopover,
  calendar: defineCalendar,
});
