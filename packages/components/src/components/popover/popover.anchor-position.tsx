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
  noStyle,
  on,
  offset,
  placement,
  strategy,
}: {
  name: MaybeRefLikeOrGetter<string>;
  noStyle?: MaybeRefLikeOrGetter<boolean | string>;
  on: MaybeRefLikeOrGetter<boolean>;
  offset?: MaybeRefLikeOrGetter<number>;
  placement?: MaybeRefLikeOrGetter<Placement>;
  strategy?: MaybeRefLikeOrGetter<'absolute' | 'fixed'>;
}) {
  const anchorName = computed(() => {
    const t = unrefOrGet(name);
    return t ? '--' + t : '';
  });
  const isOn = computed(() => anchorName.value && supportCSSAnchor && unrefOrGet(on));
  return {
    render() {
      return isOn.value && !unrefOrGet(noStyle) && <style>{`:host{anchor-name:${anchorName.value}}`}</style>;
    },
    get popStyle() {
      const [side, align] = (unrefOrGet(placement) || 'bottom').split('-');
      const insetArea = align ? side + ' span-' + align : side;
      return isOn.value
        ? ({
            positionAnchor: anchorName.value,
            insetArea,
            [insetReverseMap[side] || 'top']: toPxIfNum(unrefOrGet(offset) || 0),
            position: unrefOrGet(strategy) || 'absolute',
          } as any as CSSProperties)
        : null;
    },
  };
}
