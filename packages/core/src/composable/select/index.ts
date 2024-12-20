import { arrayFrom, getFirstOfIterable, toNoneNilSet } from '@lun-web/utils';
import { ToAllMaybeRefLike, unrefOrGet } from '../../utils';

export type UseSelectOptions<T = any> = ToAllMaybeRefLike<
  {
    multiple?: boolean;
    // when multiple is true, it needs to be Set<T>, otherwise it needs to be T
    current: Set<T> | T;
    allValues: Set<T>;
  },
  true
> & { onChange: (param: { value: T | T[]; raw: Set<T> | T }) => void };

export function useSelectMethods(options: UseSelectOptions) {
  const { multiple, current, onChange, allValues } = options;
  const isMultiple = () => !!unrefOrGet(multiple);
  const getParam = (raw: any) => ({
    raw,
    get value() {
      return isMultiple() ? arrayFrom(raw) : raw;
    },
  });
  const methods = {
    /** @private used to get raw format model */
    _: getParam,
    isSelected: (value: any) =>
      isMultiple() ? !!unrefOrGet(current)?.has(value) : unrefOrGet(current) === value && value != null,
    selectAll() {
      if (isMultiple()) onChange(getParam(unrefOrGet(allValues)));
    },
    unselectAll() {
      onChange(getParam(isMultiple() ? new Set() : null));
    },
    select(...values: any[]) {
      if (isMultiple()) {
        const v = toNoneNilSet(unrefOrGet(current), values);
        onChange(getParam(v));
      } else if (values[0] != null) onChange(getParam(values[0]));
    },
    clearAndSelect(...values: any[]) {
      if (isMultiple()) onChange(getParam(new Set(values)));
      else onChange(getParam(values[0]));
    },
    unselect(...values: any[]) {
      const v = unrefOrGet(current);
      if (isMultiple()) {
        const result = new Set(v);
        values.forEach((i) => result.delete(i));
        onChange(getParam(result));
      } else if (values[0] === undefined || unrefOrGet(current) === values[0]) onChange(getParam(null));
    },
    reverse() {
      const all = unrefOrGet(allValues) || [];
      if (isMultiple()) {
        const result = new Set(unrefOrGet(current));
        all.forEach((i) => {
          if (result.has(i)) result.delete(i);
          else result.add(i);
        });
        onChange(getParam(result));
      } else onChange(getParam(!unrefOrGet(current)?.size ? getFirstOfIterable(all) : null));
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
    /** @private used to get raw format model */
    _: result._,
    isChecked: result.isSelected,
    checkAll: result.selectAll,
    uncheckAll: result.unselectAll,
    check: result.select,
    uncheck: result.unselect,
    reverse: result.reverse,
    toggle: result.toggle,
    clearAndCheck: result.clearAndSelect,
  };
};

export const useGroupOpenMethods = (options: UseSelectOptions) => {
  const result = useSelectMethods(options);
  return {
    /** @private used to get raw format model */
    _: result._,
    isOpen: result.isSelected,
    openAll: result.selectAll,
    closeAll: result.unselectAll,
    openChildren: result.select,
    closeChildren: result.unselect,
    reverseChildren: result.reverse,
    toggleChild: result.toggle,
  };
};

export const useExpandMethods = (options: UseSelectOptions) => {
  const result = useSelectMethods(options);
  return {
    /** @private used to get raw format model */
    _: result._,
    isExpanded: result.isSelected,
    expandAll: result.selectAll,
    collapseAll: result.unselectAll,
    toggleExpand: result.toggle,
    reverseExpand: result.reverse,
    expand: result.select,
    collapse: result.unselect,
  };
};
