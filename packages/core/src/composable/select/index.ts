import { arrayFrom, capitalize, differenceOfSets, getFirstOfIterable, isEmpty, toNoneNilSet } from '@lun-web/utils';
import { MaybeRefLikeOrGetter, ToAllMaybeRefLike, unrefOrGet } from '../../utils';
import { onBeforeMount, reactive, watch } from 'vue';

export type CreateUseSelectMethods<
  SelectKey extends string = 'select',
  UnselectKey extends string = `un${SelectKey}`,
> = {
  [key in `is${Capitalize<SelectKey>}ed`]: (value: any) => boolean;
} & {
  [key in `${SelectKey}All`]: () => void;
} & {
  [key in `${UnselectKey}All`]: () => void;
} & {
  [key in SelectKey]: (...values: any[]) => void;
} & {
  [key in UnselectKey]: (...values: any[]) => void;
} & {
  [key in `clearAnd${Capitalize<SelectKey>}`]: (...values: any[]) => void;
} & {
  reverse(): void;
  toggle(value: any): void;
  /** @internal used to get raw format model */
  _(value: any): { readonly value: any; raw: any };
};

/*@__NO_SIDE_EFFECTS__*/
const createUseSelect = <SelectKey extends string = 'select', UnselectKey extends string = `un${SelectKey}`>(
  selectKey: SelectKey = 'select' as SelectKey,
  unselectKey: UnselectKey = ('un' + selectKey) as UnselectKey,
  defaultMultiple?: boolean,
  defaultWatch?: boolean,
) => {
  const capKey = capitalize(selectKey) + 'ed',
    isSelectedKey = 'is' + capKey,
    selectAllKey = selectKey + 'All',
    unselectAllKey = unselectKey + 'All',
    clearAndSelectKey = 'clearAnd' + selectKey,
    allSelectedKey = ('all' + capKey) as `all${Capitalize<SelectKey>}ed`,
    defaultSelectAllKey = 'default' + capitalize(selectAllKey);
  return (
    options: ToAllMaybeRefLike<
      {
        multiple?: boolean;
        // when multiple is true, it needs to be Set<T>, otherwise it needs to be T
        current: Set<any> | any;
        allValues: Set<any>;
      },
      true
    > & {
      [k in `default${Capitalize<SelectKey>}All`]?: MaybeRefLikeOrGetter<boolean>;
    } & {
      onChange: (param: { value: unknown | unknown[]; raw: Set<unknown> | unknown }) => void;
      watchState?: boolean;
    },
  ) => {
    const { multiple = defaultMultiple, current, onChange, allValues, watchState = defaultWatch } = options;
    const isMultiple = () => !!unrefOrGet(multiple);
    let updated = 0;
    const defaultAllSelected = () =>
      !updated && unrefOrGet((options as any)[defaultSelectAllKey]) && isEmpty(unrefOrGet(current));
    const initial = {
        [allSelectedKey]: false,
        intermediate: false,
      },
      state = reactive({
        ...initial,
      }) as { intermediate: boolean } & { [k in `all${Capitalize<SelectKey>}ed`]: boolean },
      updateState = (all: boolean, intermediate: boolean) => {
        (state as any)[allSelectedKey] = all;
        state.intermediate = intermediate;
      };
    watchState &&
      onBeforeMount(() => {
        // temporary fix. it should be immediately executed in setup, but in tree component, that will lead to access context before initialization.
        watch(
          [isMultiple, defaultAllSelected, () => unrefOrGet(current), () => unrefOrGet(allValues)],
          ([multiple, allSelected, selected, all]) => {
            if (multiple) {
              if (allSelected) return updateState(true, false);
              const selectedEmpty = isEmpty(selected),
                { size } = differenceOfSets(all, selected);
              updateState(!size && !selectedEmpty, !!size && !selectedEmpty);
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
      [isSelectedKey]: (value: any) =>
        isMultiple()
          ? defaultAllSelected() || !!unrefOrGet(current)?.has(value)
          : unrefOrGet(current) === value && value != null,
      [selectAllKey]() {
        if (isMultiple()) onChange(getParam(unrefOrGet(allValues)));
      },
      [unselectAllKey]: unselectAll,
      [selectKey](...values: any[]) {
        if (isMultiple()) {
          if (defaultAllSelected()) return onChange(getParam(unrefOrGet(allValues)));
          updated = 1;
          const v = toNoneNilSet(unrefOrGet(current), values);
          onChange(getParam(v));
        } else if (values[0] != null) onChange(getParam(values[0]));
      },
      [clearAndSelectKey](...values: any[]) {
        if (isMultiple()) {
          updated = 1;
          onChange(getParam(new Set(values)));
        } else onChange(getParam(values[0]));
      },
      [unselectKey](...values: any[]) {
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
        if ((methods as any)[isSelectedKey](value)) methods[unselectKey](value);
        else methods[selectKey](value);
      },
    } as unknown as CreateUseSelectMethods<SelectKey, UnselectKey>;
    return [state, methods] as const;
  };
};

export const useSelectMethods = createUseSelect();

export type UseSelectMethods = ReturnType<typeof useSelectMethods>[1];

export const useCheckboxMethods = createUseSelect('check', 'uncheck', true, true);

export type UseCheckboxMethods = ReturnType<typeof useCheckboxMethods>[1];

export const useExpandMethods = createUseSelect('expand', 'collapse');

export type UseExpandMethods = ReturnType<typeof useExpandMethods>[1];
