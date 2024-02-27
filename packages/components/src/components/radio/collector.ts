import { createCollector, getHostOfRootShadow } from '@lun/core';
import { RadioGroupProps, RadioProps } from './type';

export const RadioCollector = createCollector({
  name: 'radio',
  parent: null as any as RadioGroupProps,
  child: null as any as RadioProps,
  sort: true,
  parentExtra: { valueModel: { value: '' as unknown } },
  getChildEl: getHostOfRootShadow,
});
