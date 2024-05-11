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

const logicalReverseMap: Record<string, string> = {
  start: 'end',
  end: 'start',
};

const insetLogicalMap: Record<string, string> = {
  top: 'block-start',
  bottom: 'block-end',
  left: 'inline-start',
  right: 'inline-end',
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
      let insetArea = side,
        rAlign = logicalReverseMap[align];
      if (rAlign) {
        let span = ` span-`;
        if (side === 'top' || side === 'bottom') span += `inline-` + rAlign;
        else span += `block-` + rAlign;
        // if span is logical value, side must be logical value too
        insetArea = insetLogicalMap[side] + span;
      }
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
