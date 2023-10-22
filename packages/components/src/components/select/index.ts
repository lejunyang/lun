import { createCollector } from '@lun/core';
import { Select } from './Select';
import { SelectOption } from './SelectOption';

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

export type SelectExtraProvide = {
  isSelected: (value: any) => boolean;
  selectAll: () => void;
  deselectAll: () => void;
  select: (...args: any[]) => void;
  deselect: (...args: any[]) => void;
  reverse: () => void;
};

export const SelectCollector = createCollector({
  name: 'select',
  parent: Select,
  child: SelectOption,
  parentExtra: null as any as SelectExtraProvide,
});
