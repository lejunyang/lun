import { arrayFrom, differenceOfSets, getFirstOfIterable, isEmpty, toNoneNilSet } from '@lun-web/utils';
import { ToAllMaybeRefLike, unrefOrGet } from '../../utils';
import { onBeforeMount, reactive, watch } from 'vue';

export type UseSelectOptions<T = any> = ToAllMaybeRefLike<
  {
    multiple?: boolean;
    // when multiple is true, it needs to be Set<T>, otherwise it needs to be T
    current: Set<T> | T;
    allValues: Set<T>;
    defaultSelectAll?: boolean;
  },
  true
> & { onChange: (param: { value: T | T[]; raw: Set<T> | T }) => void; watchState?: boolean };

export function useSelectMethods(options: UseSelectOptions) {
  const { multiple, current, onChange, allValues, watchState } = options;
  const isMultiple = () => !!unrefOrGet(multiple);
  let updated = 0;
  const defaultAllSelected = () => !updated && unrefOrGet(options.defaultSelectAll) && isEmpty(unrefOrGet(current));
  const initial = {
      allSelected: false,
      intermediate: false,
    },
    state = reactive({
      ...initial,
    });
  watchState &&
    onBeforeMount(() => {
      // temporary fix. it should be immediately executed in setup, but in tree component, that will lead to access context before initialization.
      watch(
        [isMultiple, defaultAllSelected, () => unrefOrGet(current), () => unrefOrGet(allValues)],
        ([multiple, allSelected, selected, all]) => {
          if (multiple) {
            if (allSelected) {
              state.allSelected = true;
              state.intermediate = false;
              return;
            }
            const selectedEmpty = isEmpty(selected),
              { size } = differenceOfSets(all, selected);
            state.allSelected = !size && !selectedEmpty;
            state.intermediate = !!size && !selectedEmpty;
          } else Object.assign(state, initial);
        },
        { immediate: true },
      );
    });
  const getParam = (raw: any) => ({
    raw,
    get value() {
      return isMultiple() ? arrayFrom(raw) : raw;
    },
  });

  const unselectAll = () => {
    onChange(getParam(isMultiple() ? new Set() : null));
  };
  const methods = {
    /** @internal used to get raw format model */
    _: getParam,
    isSelected: (value: any) =>
      isMultiple()
        ? defaultAllSelected() || !!unrefOrGet(current)?.has(value)
        : unrefOrGet(current) === value && value != null,
    selectAll() {
      if (isMultiple()) onChange(getParam(unrefOrGet(allValues)));
    },
    unselectAll,
    select(...values: any[]) {
      if (isMultiple()) {
        if (defaultAllSelected()) return onChange(getParam(unrefOrGet(allValues)));
        updated = 1;
        const v = toNoneNilSet(unrefOrGet(current), values);
        onChange(getParam(v));
      } else if (values[0] != null) onChange(getParam(values[0]));
    },
    clearAndSelect(...values: any[]) {
      if (isMultiple()) {
        updated = 1;
        onChange(getParam(new Set(values)));
      } else onChange(getParam(values[0]));
    },
    unselect(...values: any[]) {
      const v = unrefOrGet(current);
      if (isMultiple()) {
        const result = new Set(defaultAllSelected() ? unrefOrGet(allValues) : v);
        updated = 1;
        values.forEach((i) => result.delete(i));
        onChange(getParam(result));
      } else if (values[0] === undefined || v === values[0]) onChange(getParam(null));
    },
    reverse() {
      const all = unrefOrGet(allValues) || [];
      if (isMultiple()) {
        updated = 1;
        if (defaultAllSelected()) return unselectAll();
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
  return [state, methods] as const;
}

export type UseSelectMethods = ReturnType<typeof useSelectMethods>[1];

export const useCheckboxMethods = (options: UseSelectOptions) => {
  const [state, methods] = useSelectMethods({ ...options, multiple: true });
  return [
    state,
    {
      /** @internal used to get raw format model */
      _: methods._,
      isChecked: methods.isSelected,
      checkAll: methods.selectAll,
      uncheckAll: methods.unselectAll,
      check: methods.select,
      uncheck: methods.unselect,
      reverse: methods.reverse,
      toggle: methods.toggle,
      clearAndCheck: methods.clearAndSelect,
    },
  ] as const;
};

export type UseCheckboxMethods = ReturnType<typeof useCheckboxMethods>[1];

export const useExpandMethods = (options: UseSelectOptions) => {
  const [state, methods] = useSelectMethods(options);
  return [
    state,
    {
      /** @internal used to get raw format model */
      _: methods._,
      isExpanded: methods.isSelected,
      expandAll: methods.selectAll,
      collapseAll: methods.unselectAll,
      toggleExpand: methods.toggle,
      reverseExpand: methods.reverse,
      expand: methods.select,
      collapse: methods.unselect,
    },
  ] as const;
};

export type UseExpandMethods = ReturnType<typeof useExpandMethods>[1];
