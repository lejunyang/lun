import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { datePickerEmits, datePickerProps } from './type';
import { defineCalendar } from '../calendar';
import { defineInput } from '../input';
import { definePopover } from '../popover';
import { useSetupEvent } from '@lun/core';

const name = 'date-picker';
export const DatePicker = defineSSRCustomElement({
  name,
  formAssociated: true,
  props: datePickerProps,
  emits: datePickerEmits,
  setup(props) {
    useSetupEvent();
    const popoverChildren = () => renderElement('input');
    return () => {
      return renderElement('popover', {
        defaultChildren: popoverChildren,
        content: renderElement('calendar', props),
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
