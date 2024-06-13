import { AnyObject, freeze, TryGet } from '@lun/utils';
import { PropFunction, PropNumber, PropObject, PropString } from 'common';
import { ExtractPropTypes, VNodeChild } from 'vue';

export interface DateInterface {
  // date: unknown;
}

export type DateValueType = TryGet<DateInterface, 'date', AnyObject>;
export type DatePanelType = 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year' | 'decade';

export const datePanelProps = freeze({
  type: PropString<DatePanelType>(),
  rows: PropNumber(),
  cols: PropNumber(),
  viewDate: PropObject<DateValueType>(),
  min: PropObject<DateValueType>(),
  max: PropObject<DateValueType>(),
  disabledDate: PropFunction<(date: DateValueType, info: { type: DatePanelType }) => boolean>(),

  headerCells: {},

  getCellDate: PropFunction(),
  getCellContent: PropFunction<(date: DateValueType) => VNodeChild>(),
  getCellProps: PropFunction(),
  lang: PropString(),
});

export type DatePanelSetupProps = ExtractPropTypes<typeof datePanelProps>;
