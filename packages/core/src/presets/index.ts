import { createBigIntDecimalMath } from './math';

export * from './math';

export const presets = {
  math: createBigIntDecimalMath(),
};