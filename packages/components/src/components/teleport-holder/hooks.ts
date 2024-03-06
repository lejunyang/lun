import { MaybeRefLikeOrGetter, unrefOrGet } from '@lun/core';
import { Teleport, VNode, computed, h } from 'vue';
import { getTeleportHolderInstance } from './TeleportHolder';

export function useTeleport<
  K extends string = 'to',
  P extends Record<K, MaybeRefLikeOrGetter<string | HTMLElement | null | undefined>> = {
    [k in K]: MaybeRefLikeOrGetter<string | HTMLElement | null | undefined>;
  },
>(props: P, key?: K) {
  key ||= 'to' as K;
  const teleportTarget = computed(() => getTeleportHolderInstance(unrefOrGet(props[key])));
  return (node: VNode, when: boolean) => (when ? h(Teleport, { to: teleportTarget.value?.shadowRoot }, node) : node);
}
