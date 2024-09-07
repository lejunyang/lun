import { arrayFrom, getFirstOfIterable, toNoneNilSet } from '@lun/utils';
import { ToMaybeRefLike, unrefOrGet } from '../../utils';

export type UseSelectOptions<T = any> = ToMaybeRefLike<
  {
    multiple?: boolean;
    valueSet?: Set<T>;
    onChange: (value: T | T[]) => void;
    allValues?: T[] | Set<T>;
  },
  'onChange'
>;

export function useSelectMethods(options: UseSelectOptions) {
  const { multiple, valueSet, onChange, allValues } = options;
  const isMultiple = () => !!unrefOrGet(multiple);
  const methods = {
    isSelected: (value: any) => !!unrefOrGet(valueSet)?.has(value),
    selectAll() {
      if (isMultiple()) onChange(arrayFrom(unrefOrGet(allValues) || []));
    },
    unselectAll() {
      onChange(isMultiple() ? [] : null);
    },
    select(...values: any[]) {
      if (isMultiple()) {
        const v = toNoneNilSet(unrefOrGet(valueSet), values);
        onChange(arrayFrom(v));
      } else if (values[0] != null) onChange(values[0]);
    },
    unselect(...values: any[]) {
      const v = unrefOrGet(valueSet);
      if (isMultiple()) {
        const result = new Set(v);
        values.forEach((i) => result.delete(i));
        onChange(arrayFrom(result));
      } else {
        if (values[0] === undefined || getFirstOfIterable(unrefOrGet(valueSet)!) === values[0]) onChange(null);
      }
    },
    reverse() {
      const all = unrefOrGet(allValues) || [];
      if (isMultiple()) {
        const result = new Set(unrefOrGet(valueSet));
        all.forEach((i) => {
          if (result.has(i)) result.delete(i);
          else result.add(i);
        });
        onChange(arrayFrom(result));
      } else onChange(!unrefOrGet(valueSet)?.size ? arrayFrom(all)[0] : null);
    },
    toggle(value: any) {
      if (methods.isSelected(value)) methods.unselect(value);
      else methods.select(value);
    },
  };
  return methods;
}

export const useCheckboxMethods = (options: UseSelectOptions) => {
  const result = useSelectMethods({ ...options, multiple: true });
  return {
    isChecked: result.isSelected,
    checkAll: result.selectAll,
    uncheckAll: result.unselectAll,
    check: result.select,
    uncheck: result.unselect,
    reverse: result.reverse,
    toggle: result.toggle,
  };
};

export const useGroupOpenMethods = (options: UseSelectOptions) => {
  const result = useSelectMethods(options);
  return {
    isOpen: result.isSelected,
    openAll: result.selectAll,
    closeAll: result.unselectAll,
    openChildren: result.select,
    closeChildren: result.unselect,
    reverseChildren: result.reverse,
    toggleChild: result.toggle,
  };
};
