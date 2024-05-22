import { freeze } from '@lun/utils';
import { GetEventPropsFromEmits, PropNumber, PropNumOrArr, PropString } from 'common';
import { ExtractPropTypes } from 'vue';

export const rangeProps = freeze({
  value: PropNumOrArr(),
  type: PropString<'horizontal' | 'vertical'>(),
  min: PropNumber(),
  max: PropNumber(),
  step: PropNumber(),
});

export const rangeEmits = freeze({});

export type RangeSetupProps = ExtractPropTypes<typeof rangeProps>;
export type RangeEvents = GetEventPropsFromEmits<typeof rangeEmits>;
export type RangeProps = Partial<RangeSetupProps> & RangeEvents;
