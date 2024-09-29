import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { treeItemEmits, treeItemProps } from './type';
import { defineIcon } from '../icon/Icon';
import { useExpose, useNamespace, useSlot } from 'hooks';
import { getCompParts } from 'common';
import { TreeCollector } from './collector';
import { toGetterDescriptors, toPxIfNum } from '@lun/utils';
import { useSetupEdit } from '@lun/core';

const name = 'tree-item';
const parts = ['root', 'children', 'indent'] as const;
const compParts = getCompParts(name, parts);
export const TreeItem = defineSSRCustomElement({
  name,
  props: treeItemProps,
  emits: treeItemEmits,
  setup(props) {
    const ns = useNamespace(name);
    useSetupEdit();

    const context = TreeCollector.child()!;
    if (__DEV__ && !context) throw new Error(name + ' must be under tree component');

    useExpose({}, toGetterDescriptors(context, { level: 'level', isLeaf: 'isLeaf' }));

    const [renderLabel] = useSlot('label', () => props.label);
    return () => {
      const { level, isLeaf, parent } = context;
      return (
        <>
          <li class={ns.t} part={compParts[0]} data-root={level === 0} data-level={level}>
            <div
              class={ns.e('indent')}
              part={compParts[2]}
              // TODO level - 1 if all this level tree-items have no children
              style={{ width: toPxIfNum(+(parent!.props.indentSize || 0) * (level + 1)) }}
            >
              {!isLeaf && renderElement('icon', { name: 'down', class: ns.e('toggle') })}
            </div>
            {renderLabel()}
          </li>
          {!isLeaf && (
            <ul part={compParts[1]}>
              <slot></slot>
            </ul>
          )}
        </>
      );
    };
  },
});

export type tTreeItem = typeof TreeItem;
export type iTreeItem = InstanceType<tTreeItem>;

export const defineTreeItem = createDefineElement(name, TreeItem, {}, parts, {
  icon: defineIcon,
});
