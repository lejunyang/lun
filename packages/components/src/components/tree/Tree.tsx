import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { treeEmits, treeProps } from './type';
import { useValueSet, useCEExpose, useNamespace, useValueModel } from 'hooks';
import { getCompParts } from 'common';
import { TreeCollector, TreeExtraProvide } from './collector';
import { objectComputed, useExpandMethods, useSelectMethods, useSetupEdit } from '@lun-web/core';
import { useCollectorValue } from '../../hooks/useCollectorValue';
import { extend, unionOfSets } from '@lun-web/utils';
import { useTreeCheckMethods } from './tree.check';
import { useTreeItems } from './tree.items';
import { Item } from './tree.common';

const name = 'tree';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const Tree = defineSSRCustomElement({
  name,
  props: treeProps,
  emits: treeEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const isSelectMultiple = () => ['multiple', 'ctrl-multiple'].includes(props.selectMode!);
    const [editComputed] = useSetupEdit();
    const getModelOptions = (event: 'select' | 'check' | 'expand') => ({
      key: `${event}ed` as `${typeof event}ed`,
      hasRaw: true as true,
      emit: (_: string, value: any) => {
        emit(event as any, value);
        emit('update', {
          selected: selectedModel.value as any,
          checked: checkedModel.value as any,
          expanded: expandedModel.value as any,
        });
      },
    });
    const selectedModel = useValueModel(props, getModelOptions('select')),
      checkedModel = useValueModel(props, getModelOptions('check')),
      expandedModel = useValueModel(props, getModelOptions('expand'));
    const selectedValueSet = useValueSet(selectedModel, isSelectMultiple),
      checkedValueSet = useValueSet(checkedModel, true),
      expandedValueSet = useValueSet(expandedModel, true);

    const [propItemsInfo, propItemsValueInfo, renderItems, valueToItem] = useTreeItems(props, editComputed);
    const [vmChildrenInfo, valueToVm] = useCollectorValue(() => context, true);
    const valueToChild = (value: any) => (valueToItem(value) ?? valueToVm(value)) as Item;
    const combinedChildren = objectComputed(() => {
      return {
        items: ([] as Item[]).concat(propItemsInfo.items, context.value),
        noneLeafValuesSet: unionOfSets(propItemsValueInfo.noneLeafValuesSet, vmChildrenInfo.noneLeafValuesSet),
        childrenValuesSet: unionOfSets(propItemsValueInfo.childrenValuesSet, vmChildrenInfo.childrenValuesSet),
      };
    });

    const checkMethods = useTreeCheckMethods({
      current: checkedValueSet,
      childrenInfo: combinedChildren,
      valueToChild,
      onChange(value) {
        checkedModel.value = value;
      },
      allValues: () => combinedChildren.childrenValuesSet,
    });

    const selectMethods = useSelectMethods({
      multiple: isSelectMultiple,
      current: selectedValueSet,
      onChange(value) {
        selectedModel.value = value;
      },
      allValues: () => combinedChildren.childrenValuesSet,
    });
    const expandMethods = useExpandMethods(
      extend(
        {
          multiple: true,
          current: expandedValueSet,
          onChange(value) {
            expandedModel.value = value;
          },
          allValues: () => combinedChildren.noneLeafValuesSet,
        },
        props, // to get `defaultExpandAll`
      ),
    );
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
export type TreeExpose = {
  methods: TreeExtraProvide;
};
export type iTree = InstanceType<tTree> & TreeExpose;

export const defineTree = createDefineElement(name, Tree, {}, parts, {});
