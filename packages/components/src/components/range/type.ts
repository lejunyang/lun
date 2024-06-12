import { freeze } from '@lun/utils';
import {
  CommonProps,
  editStateProps,
  GetEventPropsFromEmits,
  PropBoolean,
  PropNumber,
  PropNumOrArr,
  PropObject,
  PropString,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const rangeProps = freeze({
  ...editStateProps,
  value: PropNumOrArr(),
  type: PropString<'horizontal' | 'vertical'>(),
  valueType: PropString<'number' | 'number-string'>(), // TODO
  min: PropNumber(),
  max: PropNumber(),
  step: PropNumber(),
  precision: PropNumber(),
  strict: PropBoolean(),
  labels: PropObject<Record<string | number, string>>(),
  trackDraggable: PropBoolean(),
});

export const rangeEmits = freeze({
  update: (_: number | number[]) => true,
});

export type RangeSetupProps = ExtractPropTypes<typeof rangeProps> & CommonProps;
export type RangeEvents = GetEventPropsFromEmits<typeof rangeEmits>;
export type RangeProps = Partial<RangeSetupProps> & RangeEvents;
