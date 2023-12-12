import { createCollector, useSelect } from '@lun/core';
import { Select } from './Select';
import { SelectOption } from './SelectOption';

export * from './Select';
export * from './SelectOptgroup';
export * from './SelectOption';

export * from './type';

export const SelectCollector = createCollector({
  name: 'select',
  parent: Select,
  child: SelectOption,
  parentExtra: null as any as ReturnType<typeof useSelect>,
});
