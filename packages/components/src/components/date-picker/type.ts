import { DateValueType } from '@lun-web/core';
import { freeze } from '@lun-web/utils';
import { GetEventPropsFromEmits, CommonProps, PropObject, createEmits, GetEventMapFromEmits } from 'common';
import { ExtractPropTypes } from 'vue';
import { calendarProps, CalendarUpdateDetail } from '../calendar';

export const datePickerProps = freeze({
  ...calendarProps,
  /**
   * @locale.zh-CN 透传给内部 popover 组件的属性，用于自定义弹出层的行为与样式
   * @locale.en Props forwarded to the internal popover element to customize the popup behavior and styling
   */
  popoverProps: PropObject(),
  /**
   * @locale.zh-CN 透传给内部 input 组件的属性，用于自定义输入框的行为与样式
   * @locale.en Props forwarded to the internal input element to customize the input behavior and styling
   */
  inputProps: PropObject(),
});

export const datePickerEmits = createEmits<{
  update: CalendarUpdateDetail;
  updateViewDate: DateValueType;
}>(['update', 'updateViewDate']);

export type DatePickerSetupProps = ExtractPropTypes<typeof datePickerProps> & CommonProps;
export type DatePickerEventProps = GetEventPropsFromEmits<typeof datePickerEmits>;
export type DatePickerEventMap = GetEventMapFromEmits<typeof datePickerEmits>;
export type DatePickerProps = Partial<DatePickerSetupProps> & DatePickerEventProps;
