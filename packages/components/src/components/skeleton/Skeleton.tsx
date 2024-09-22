import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { skeletonEmits, skeletonProps } from './type';
import { Transition } from 'vue';
import { useNamespace } from 'hooks';
import { getCompParts, getTransitionProps } from 'common';
import { useSetupEdit } from '@lun/core';

const name = 'skeleton';
const parts = [name] as const;
const compParts = getCompParts(name, parts);
export const Skeleton = defineSSRCustomElement({
  name,
  props: skeletonProps,
  emits: skeletonEmits,
  setup(props) {
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();

    return () => {
      return [
        <Transition {...getTransitionProps(props, 'load', 'fade')}>
          <div class={ns.t} part={compParts[0]} v-show={editComputed.loading}>
            <slot name={name}></slot>
          </div>
        </Transition>,
        <slot></slot>,
      ];
    };
  },
});

export type tSkeleton = typeof Skeleton;
export type iSkeleton = InstanceType<tSkeleton>;

export const defineSkeleton = createDefineElement(name, Skeleton, {}, parts);
