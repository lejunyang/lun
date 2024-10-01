import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { treeEmits, treeProps } from './type';
import { useNamespace, useValueModel } from 'hooks';
import { getCompParts } from 'common';
import { TreeCollector } from './collector';
import { useCheckboxMethods, useSelectMethods, useSetupEdit } from '@lun/core';
import { useCollectorValue } from '../../hooks/useCollectorValue';
import { computed } from 'vue';
import { toArrayIfNotNil } from '@lun/utils';

const name = 'tree';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const Tree = defineSSRCustomElement({
  name,
  props: treeProps,
  emits: treeEmits,
  setup(props) {
    const ns = useNamespace(name);
    useSetupEdit();
    const selectedModel = useValueModel(props, { key: 'selected', eventName: 'select' }),
      checkedModel = useValueModel(props, { key: 'checked', eventName: 'check' }),
      expandedModel = useValueModel(props, { key: 'expanded', eventName: 'expand' });
    const selectedValueSet = computed(() => new Set(toArrayIfNotNil(selectedModel.value))),
      checkedValueSet = computed(() => new Set(toArrayIfNotNil(checkedModel.value))),
      expandedValueSet = computed(() => new Set(toArrayIfNotNil(expandedModel.value)));
    const selectMethods = useSelectMethods({
      multiple: () => props.selectable === 'multiple',
      valueSet: selectedValueSet,
      onChange(value) {
        selectedModel.value = value;
      },
      allValues: () => childrenInfo.childrenValuesSet,
    });
    const checkMethods = useCheckboxMethods({
      valueSet: checkedValueSet,
      onChange(value) {
        checkedModel.value = value;
      },
      allValues: () => childrenInfo.childrenValuesSet,
    });
    const _expandMethods = useCheckboxMethods({
      valueSet: expandedValueSet,
      onChange(value) {
        expandedModel.value = value;
      },
      allValues: () => childrenInfo.noneLeafValuesSet,
    });
    const expandMethods = {
      isExpanded: _expandMethods.isChecked,
      expandAll: _expandMethods.checkAll,
      collapseAll: _expandMethods.uncheckAll,
      toggleExpand: _expandMethods.toggle,
      reverseExpand: _expandMethods.reverse,
      expand: _expandMethods.check,
      collapse: _expandMethods.uncheck,
    };
    const [childrenInfo] = useCollectorValue(() => context, true);
    const context = TreeCollector.parent({
      extraProvide: {
        select: selectMethods,
        check: checkMethods,
        expand: expandMethods,
      },
    });

    return () => {
      return (
        <ul class={ns.t} part={compParts[0]}>
          <slot></slot>
        </ul>
      );
    };
  },
});

export type tTree = typeof Tree;
export type iTree = InstanceType<tTree>;

export const defineTree = createDefineElement(
  name,
  Tree,
  {
    indentSize: 20,
  },
  parts,
  {},
);
