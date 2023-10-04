import { createCollector } from '@lun/core';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';
export * from './Radio';
export * from './RadioGroup';

export const RadioCollector = createCollector({
  name: 'radio',
  parent: RadioGroup,
  child: Radio,
  parentExtra: { valueModel: { value: '' as unknown } },
});
