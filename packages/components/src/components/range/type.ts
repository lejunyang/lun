import { freeze } from '@lun-web/utils';
import {
  CommonProps,
  createEmits,
  editStateProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  PropBoolean,
  PropFunction,
  PropNumber,
  PropNumOrArr,
  PropObject,
  PropString,
} from 'common';
import { CSSProperties, ExtractPropTypes } from 'vue';

export const rangeProps = freeze({
  ...editStateProps,
  value: PropNumOrArr(),
  type: PropString<'horizontal' | 'vertical'>(),
  valueType: PropString<'number' | 'number-text'>(),
  min: PropNumber(),
  max: PropNumber(),
  step: PropNumber(),
  precision: PropNumber(),
  strict: PropBoolean(),
  labels: PropObject<Record<string | number, string>>(),
  trackDraggable: PropBoolean(),
  tooltipProps: PropObject(),
  tooltipFormatter: PropFunction<(value: string) => string>(),
  noTooltip: PropBoolean(),
  railStyle: PropObject<CSSProperties>(),
  trackStyle: PropObject<CSSProperties>(),
});

export const rangeEmits = createEmits<{
  update: number | number[];
}>(['update']);

export type RangeSetupProps = ExtractPropTypes<typeof rangeProps> & CommonProps;
export type RangeEventProps = GetEventPropsFromEmits<typeof rangeEmits>;
export type RangeEventMap = GetEventMapFromEmits<typeof rangeEmits>;
export type RangeProps = Partial<RangeSetupProps> & RangeEventProps;
