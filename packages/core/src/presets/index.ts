import { TryGet } from '@lun/utils';
import { DateMethods } from './date';
import { createBigIntDecimalMath } from './math';

export * from './math';
export * from './date';

export interface DateInterface {
  // date: unknown;
}

export type DateValueType = TryGet<DateInterface, 'date', any>;
export type DatePanelType = 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year' | 'decade';

export const presets = Object.seal({
  /** define the methods used to process numbers, now used in number input only */
  math: createBigIntDecimalMath(),
  date: null as any as DateMethods<DateValueType>,
});

export type Presets = typeof presets;