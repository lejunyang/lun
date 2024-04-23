import { MaybeRefLikeOrGetter, unrefOrGet } from '@lun/core';
import { Teleport, VNode, computed, getCurrentInstance, h } from 'vue';
import { getTeleportHolderInstance } from './TeleportHolder';
import { virtualParentMap } from '../../custom/virtualParent';
import { isElement } from '@lun/utils';

export function useTeleport<
  K extends string = 'to',
  P extends Record<K, MaybeRefLikeOrGetter<string | HTMLElement | null | undefined>> = {
    [k in K]: MaybeRefLikeOrGetter<string | HTMLElement | null | undefined>;
  },
>(props: P, when: MaybeRefLikeOrGetter<boolean>, key?: K) {
  key ||= 'to' as K;
  const teleportTarget = computed(() => getTeleportHolderInstance(unrefOrGet(props[key])));
  const vm = getCurrentInstance();
  return [
    (node: VNode) => {
      return unrefOrGet(when)
        ? h(
            Teleport,
            {
              to: teleportTarget.value?.shadowRoot,
            },
            node,
          )
        : node;
    },
    /**
     * must set onVnodeBeforeMount on actual HTML element vnode, not Vue Component vnode(or we can't get el onVnodeBeforeMount, and onVnodeMounted is too late for parent vnode)
     */
    {
      onVnodeBeforeMount: (({ el }) => {
        // TODO need to test change 'when' dynamically
        if (isElement(el) && vm?.CE && unrefOrGet(when)) {
          virtualParentMap.set(el, vm.CE);
        } else virtualParentMap.delete(el as any);
      }) as (v: VNode) => void,
    },
    teleportTarget,
  ] as const;
}
