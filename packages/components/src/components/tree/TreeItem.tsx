import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { treeItemEmits, treeItemProps } from './type';
import { defineIcon } from '../icon/Icon';
import { useNamespace, useSlot } from 'hooks';
import { getCompParts } from 'common';
import { TreeCollector } from './collector';

const name = 'tree-item';
const parts = ['root', 'children'] as const;
const compParts = getCompParts(name, parts);
export const TreeItem = defineSSRCustomElement({
  name,
  props: treeItemProps,
  emits: treeItemEmits,
  setup(props) {
    const ns = useNamespace(name);

    const parent = TreeCollector.child();

    const [renderLabel] = useSlot('label', () => props.label);
    return () => {
      return (
        <>
          <li class={ns.t} part={compParts[0]} data-root={parent?.level === 0}>
            {renderLabel()}
          </li>
          <ul part={compParts[1]}>
            <slot></slot>
          </ul>
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
