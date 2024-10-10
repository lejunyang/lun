import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { treeEmits, treeProps } from './type';
import { useCEExpose, useNamespace, useValueModel } from 'hooks';
import { getCompParts } from 'common';
import { TreeCollector, TreeExtraProvide } from './collector';
import { useCheckboxMethods, useSelectMethods, useSetupEdit } from '@lun/core';
import { useCollectorValue } from '../../hooks/useCollectorValue';
import { computed } from 'vue';
import { toArrayIfNotNil } from '@lun/utils';
import { useTreeCheckedValue } from './tree.checked-value';
import { useTreeCheckMethods } from './tree.check-methods';
import { useTreeItems } from './tree.items';

const name = 'tree';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const Tree = defineSSRCustomElement({
  name,
  props: treeProps,
  emits: treeEmits,
  setup(props) {
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();
    const selectedModel = useValueModel(props, { key: 'selected', eventName: 'select' }), // TODO add hasRaw
      checkedModel = useValueModel(props, { key: 'checked', eventName: 'check' }),
      expandedModel = useValueModel(props, { key: 'expanded', eventName: 'expand' });
    const selectedValueSet = computed(() => new Set(toArrayIfNotNil(selectedModel.value))),
      checkedValueSet = computed(() => new Set(toArrayIfNotNil(checkedModel.value))),
      expandedValueSet = computed(() => {
        const { value } = expandedModel;
        return props.defaultExpandAll && value == null
          ? childrenInfo.noneLeafValuesSet
          : new Set(toArrayIfNotNil(value));
      });

    const [propItemsInfo, renderItems] = useTreeItems(props, editComputed);
    const [childrenInfo, valueToChild] = useCollectorValue(() => context, true);
    const [correctedCheckedSet, vmCheckedChildrenCountMap] = useTreeCheckedValue(() => context, checkedValueSet);
    const checkMethods = useTreeCheckMethods({
      valueSet: correctedCheckedSet,
      childrenInfo,
      childrenCheckedMap: vmCheckedChildrenCountMap,
      getContext: () => context,
      valueToChild,
      onChange(value) {
        checkedModel.value = value;
      },
      allValues: () => childrenInfo.childrenValuesSet,
    });

    const selectMethods = useSelectMethods({
      multiple: () => ['multiple', 'ctrl-multiple'].includes(props.selectMode!),
      valueSet: selectedValueSet,
      onChange(value) {
        selectedModel.value = value;
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
    const methods = {
      select: selectMethods,
      check: checkMethods,
      expand: expandMethods,
    };
    const context = TreeCollector.parent({
      extraProvide: methods,
    });

    useCEExpose({ methods });

    return () => {
      return (
        <ul class={ns.t} part={compParts[0]}>
          {renderItems()}
          <slot></slot>
        </ul>
      );
    };
  },
});

export type tTree = typeof Tree;
export type TreeExpose = TreeExtraProvide;
export type iTree = InstanceType<tTree> & TreeExpose;

export const defineTree = createDefineElement(name, Tree, {}, parts, {});
