import { createCollector } from '@lun/core';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';

export * from './Radio';
export * from './RadioGroup';
export * from './type';

export const RadioCollector = createCollector({
  name: 'radio',
  parent: RadioGroup,
  child: Radio,
  sort: true,
  parentExtra: { valueModel: { value: '' as unknown } },
  getChildEl: (el) => (el.parentNode as ShadowRoot).host, // must, as it's Fragment root, getPreviousMatchElInTree will not work
});
