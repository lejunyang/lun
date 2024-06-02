import { freeze } from '@lun/utils';
import { editStateProps, GetEventPropsFromEmits, PropBoolean, PropNumber, PropNumOrArr, PropString } from 'common';
import { ExtractPropTypes } from 'vue';

export const rangeProps = freeze({
  ...editStateProps,
  value: PropNumOrArr(),
  type: PropString<'horizontal' | 'vertical'>(),
  min: PropNumber(),
  max: PropNumber(),
  step: PropNumber(),
  precision: PropNumber(),
  strict: PropBoolean(),
});

export const rangeEmits = freeze({
  update: (_: number | number[]) => true,
});

export type RangeSetupProps = ExtractPropTypes<typeof rangeProps>;
export type RangeEvents = GetEventPropsFromEmits<typeof rangeEmits>;
export type RangeProps = Partial<RangeSetupProps> & RangeEvents;
