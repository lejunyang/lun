import { createBigIntDecimalMath } from './math';

export * from './math';
export * from './date';

export const presets = {
  /** define the methods used to process numbers, now used in number input only */
  math: createBigIntDecimalMath(),
};