import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { treeEmits, treeProps } from './type';
import { useNamespace } from 'hooks';
import { getCompParts } from 'common';
import { TreeCollector } from './collector';
import { useSetupEdit } from '@lun/core';

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
    const context = TreeCollector.parent();

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