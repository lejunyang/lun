import { defineCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { skeletonEmits, skeletonProps } from './type';
import { Transition } from 'vue';
import { useNamespace } from 'hooks';
import { ElementWithExpose, getCompParts, getTransitionProps } from 'common';
import { useSetupEdit } from '@lun-web/core';

const name = 'skeleton';
const parts = [name] as const;
const compParts = getCompParts(name, parts);
export const Skeleton = defineCustomElement({
  name,
  props: skeletonProps,
  emits: skeletonEmits,
  setup(props) {
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();

    return () => {
      return [
        <Transition {...getTransitionProps(props, 'load', 'fade')}>
          <div
            class={[ns.t, ns.is('hidden', !editComputed.loading)]}
            part={compParts[0]}
            v-content={editComputed.loading}
          >
            <slot name={name}></slot>
          </div>
        </Transition>,
        <slot></slot>,
      ];
    };
  },
});

export type SkeletonExpose = {};
export type tSkeleton = ElementWithExpose<typeof Skeleton, SkeletonExpose>;
export type iSkeleton = InstanceType<tSkeleton>;

export const defineSkeleton = createDefineElement(name, Skeleton, {}, parts);
