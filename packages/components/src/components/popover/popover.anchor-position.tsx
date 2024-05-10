import { Placement } from '@floating-ui/vue';
import { MaybeRefLikeOrGetter, unrefOrGet } from '@lun/core';
import { supportCSSAnchor, toPxIfNum } from '@lun/utils';
import { computed, CSSProperties } from 'vue';

export const insetReverseMap: Record<string, string> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
};

export function useAnchorPosition({
  name,
  inner,
  off,
  offset,
  placement,
  strategy,
}: {
  name: MaybeRefLikeOrGetter<string>;
  inner?: MaybeRefLikeOrGetter<boolean | string>;
  off?: MaybeRefLikeOrGetter<boolean>;
  offset?: MaybeRefLikeOrGetter<number>;
  placement?: MaybeRefLikeOrGetter<Placement>;
  strategy?: MaybeRefLikeOrGetter<'absolute' | 'fixed'>;
}) {
  const isOn = computed(() => unrefOrGet(name) && supportCSSAnchor && !unrefOrGet(off));
  return {
    render() {
      return isOn.value && unrefOrGet(inner) && <style>{`:host{anchor-name:${unrefOrGet(name)}}`}</style>;
    },
    get popStyle() {
      const [side, align] = (unrefOrGet(placement) || 'bottom').split('-');
      const insetArea = align ? side + ' span-' + align : side;
      return isOn.value
        ? ({
            positionAnchor: unrefOrGet(inner) ? unrefOrGet(name) : null, // anchor-name can not cross shadow tree... we only set positionAnchor when it's inner anchorName
            insetArea,
            [insetReverseMap[side] || 'top']: toPxIfNum(unrefOrGet(offset) || 0),
            position: unrefOrGet(strategy) || 'absolute',
          } as any as CSSProperties)
        : null;
    },
  };
}
