import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { treeEmits, treeProps } from './type';
import { useValueSet, useCEExpose, useNamespace, useValueModel } from 'hooks';
import { getCompParts } from 'common';
import { TreeCollector, TreeExtraProvide } from './collector';
import { objectComputed, useCheckboxMethods, useSelectMethods, useSetupEdit } from '@lun/core';
import { useCollectorValue } from '../../hooks/useCollectorValue';
import { ComponentInternalInstance, computed } from 'vue';
import { toArrayIfNotNil, unionOfSets } from '@lun/utils';
import { useTreeCheckedValue } from './tree.checked-value';
import { useTreeCheckMethods } from './tree.check-methods';
import { InternalTreeItem, useTreeItems } from './tree.items';

const name = 'tree';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const Tree = defineSSRCustomElement({
  name,
  props: treeProps,
  emits: treeEmits,
  setup(props) {
    const ns = useNamespace(name);
    const isSelectMultiple = () => ['multiple', 'ctrl-multiple'].includes(props.selectMode!);
    const [editComputed] = useSetupEdit();
    const selectedModel = useValueModel(props, { key: 'selected', eventName: 'select', hasRaw: true }),
      checkedModel = useValueModel(props, { key: 'checked', eventName: 'check', hasRaw: true }),
      expandedModel = useValueModel(props, { key: 'expanded', eventName: 'expand', hasRaw: true });
    const selectedValueSet = useValueSet(selectedModel, isSelectMultiple),
      checkedValueSet = useValueSet(checkedModel, true),
      expandedValueSet = computed(() => {
        const { value } = expandedModel;
        return props.defaultExpandAll && value.value == null
          ? combinedChildren.noneLeafValuesSet
          : value.raw || new Set(toArrayIfNotNil(value.value));
      });

    const [propItemsInfo, renderItems, valueToItem] = useTreeItems(props, editComputed);
    const [vmChildrenInfo, valueToVm] = useCollectorValue(() => context, true);
    const valueToChild = (value: any) => valueToItem(value) ?? valueToVm(value);
    const combinedChildren = objectComputed(() => {
      return {
        items: ([] as (InternalTreeItem | ComponentInternalInstance)[]).concat(propItemsInfo.items, context.value),
        noneLeafValuesSet: unionOfSets(propItemsInfo.noneLeafValuesSet, vmChildrenInfo.noneLeafValuesSet),
        childrenValuesSet: unionOfSets(propItemsInfo.childrenValuesSet, vmChildrenInfo.childrenValuesSet),
      };
    });

    const [correctedCheckedSet, checkedChildrenCountMap] = useTreeCheckedValue(combinedChildren, checkedValueSet);
    const checkMethods = useTreeCheckMethods({
      value: correctedCheckedSet,
      childrenInfo: combinedChildren,
      childrenCheckedMap: checkedChildrenCountMap,
      valueToChild,
      onChange(value) {
        checkedModel.value = value;
      },
      allValues: () => combinedChildren.childrenValuesSet,
    });

    const selectMethods = useSelectMethods({
      multiple: isSelectMultiple,
      value: selectedValueSet,
      onChange(value) {
        selectedModel.value = value;
      },
      allValues: () => combinedChildren.childrenValuesSet,
    });
    const _expandMethods = useCheckboxMethods({
      value: expandedValueSet,
      onChange(value) {
        expandedModel.value = value;
      },
      allValues: () => combinedChildren.noneLeafValuesSet,
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
