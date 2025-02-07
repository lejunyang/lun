import { defineCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { treeEmits, treeProps } from './type';
import { useValueSet, useCEExpose, useNamespace, useValueModel, useChildrenValue, usePropChildrenRender } from 'hooks';
import { ElementWithExpose, getCompParts } from 'common';
import { TreeCollector, TreeExtraProvide } from './collector';
import { useExpandMethods, useSelectMethods, useSetupEdit } from '@lun-web/core';
import { extend } from '@lun-web/utils';
import { useTreeCheckMethods } from './tree.check';
import { defineTreeItem } from './TreeItem';

const name = 'tree';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const Tree = defineCustomElement({
  name,
  props: treeProps,
  emits: treeEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const isSelectMultiple = () => ['multiple', 'ctrl-multiple'].includes(props.selectionMode!);
    useSetupEdit();
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

    const [childSetup, childrenValues, noneLeafValues, valueToChild] = useChildrenValue();
    const renderItems = usePropChildrenRender(
      () => props.items,
      (item, children) => renderElement('tree-item', item, children),
      1,
      () => props.itemPropsMap,
    );

    const checkMethods = useTreeCheckMethods({
      current: checkedValueSet,
      getItems: () => context.value,
      noneLeafValues,
      valueToChild,
      onChange(value) {
        checkedModel.value = value;
      },
      allValues: childrenValues,
    });

    const [, selectMethods] = useSelectMethods({
      multiple: isSelectMultiple,
      current: selectedValueSet,
      onChange(value) {
        selectedModel.value = value;
      },
      allValues: childrenValues,
    });
    const [, expandMethods] = useExpandMethods(
      extend(
        {
          multiple: true,
          current: expandedValueSet,
          onChange(value) {
            expandedModel.value = value;
          },
          allValues: noneLeafValues,
        },
        props,
      ),
    );
    const methods = {
      select: selectMethods,
      check: checkMethods,
      expand: expandMethods,
    };
    const context = TreeCollector.parent({
      childSetup,
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

export type TreeExpose = {
  methods: TreeExtraProvide;
};
export type tTree = ElementWithExpose<typeof Tree, TreeExpose>;
export type iTree = InstanceType<tTree>;

export const defineTree = createDefineElement(name, Tree, {}, parts, [defineTreeItem]);
