import { createCollector } from '@lun-web/core';
import { RadioGroupProps, RadioProps } from './type';
import { getCollectorOptions } from 'common';

export const RadioCollector = createCollector<
  RadioGroupProps,
  RadioProps,
  {
    valueModel: { value: unknown };
  }
>(getCollectorOptions('radio', true));
