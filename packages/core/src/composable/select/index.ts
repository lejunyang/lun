import { toNoneNilSet } from '@lun/utils';
import { ToMaybeRefLike, unrefOrGet } from '../../utils';

export type UseSelectOptions<T = any> = ToMaybeRefLike<{
  multiple?: boolean;
  value?: T;
  valueSet?: Set<T>;
  onChange: (value: T | T[]) => void;
  allValues?: T[] | Set<T>;
}, 'onChange'>;

export function useSelect(options: UseSelectOptions) {
  const { multiple, value, valueSet, onChange, allValues } = options;
  const isMultiple = () => !!unrefOrGet(multiple);
  const methods = {
    isSelected: (value: any) => !!unrefOrGet(valueSet)?.has(value),
    selectAll() {
      if (isMultiple()) onChange(Array.from(unrefOrGet(allValues) || []));
    },
    unselectAll() {
      onChange(isMultiple() ? [] : null);
    },
    select(...values: any[]) {
      if (isMultiple()) {
        const v = toNoneNilSet(unrefOrGet(valueSet), values);
        onChange(Array.from(v));
      } else if (values[0] != null) onChange(values[0]);
    },
    unselect(...values: any[]) {
      const v = unrefOrGet(valueSet);
      if (isMultiple()) {
        const result = new Set(v);
        values.forEach((i) => result.delete(i));
        onChange(Array.from(result));
      } else {
        if (values[0] === undefined || unrefOrGet(value) === values[0]) onChange(null);
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
        onChange(Array.from(result));
      } else onChange(unrefOrGet(value) == null ? Array.from(all)[0] : null);
    },
    toggle(value: any) {
      if (methods.isSelected(value)) methods.unselect(value);
      else methods.select(value);
    },
  };
  return methods;
}

export const useCheckbox = (options: UseSelectOptions) => {
  const result = useSelect({ ...options, multiple: true });
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
