import { createCollector } from '@lun/core';

export * from './Select';
export * from './SelectOptGroup';
export * from './SelectOption';

export type {
  SelectProps,
  SelectOptGroupProps,
  SelectOptionProps,
  SelectOptions,
  SelectOption,
  SelectOptGroup,
} from './type';

export const SelectCollector = createCollector({
  name: 'select',
});
