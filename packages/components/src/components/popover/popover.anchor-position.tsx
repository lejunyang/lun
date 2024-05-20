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

export function useAnchorPosition(options: {
  name: MaybeRefLikeOrGetter<string>;
  inner?: MaybeRefLikeOrGetter<boolean | string>;
  off?: MaybeRefLikeOrGetter<boolean>;
  offset?: MaybeRefLikeOrGetter<number>;
  placement?: MaybeRefLikeOrGetter<Placement>;
  strategy?: 'absolute' | 'fixed';
  arrowPosition?: 'start' | 'end' | 'center';
  arrowOffset?: number | string;
}) {
  const { name, inner, off, offset, placement } = options;
  const isOn = computed(() => unrefOrGet(name) && supportCSSAnchor && !unrefOrGet(off));
  const sideAndAlign = computed(() => {
    const [side, align] = (unrefOrGet(placement) || 'bottom').split('-');
    return [side, align, side === 'top' || side === 'bottom' ? 'inline-' : 'block-'];
  });
  const anchorName = '--p'; // it's for arrow element, always turn on anchor position for arrow element if supports
  return {
    isOn,
    render() {
      return isOn.value && unrefOrGet(inner) && <style>{`:host{anchor-name:${unrefOrGet(name)}}`}</style>;
    },
    popStyle(fallbackStyles: any) {
      const [side, align, inset] = sideAndAlign.value;
      let insetArea = side,
        rAlign = logicalReverseMap[align];
      if (rAlign) {
        // if span is logical value, side must be logical value too
        insetArea = insetLogicalMap[side] + ` span-` + inset + rAlign;
      }
      return isOn.value
        ? ({
            positionAnchor: unrefOrGet(inner) ? unrefOrGet(name) : null, // anchor-name can not cross shadow tree... we only set positionAnchor when it's inner anchorName
            insetArea,
            [insetReverseMap[side] || 'top']: toPxIfNum(unrefOrGet(offset) || 0),
            position: options.strategy || 'absolute',
            anchorName,
          } as any as CSSProperties)
        : { ...fallbackStyles, anchorName };
    },
    arrowStyle(x?: number, y?: number, arrowSize = 0) {
      const [side, _, inset] = sideAndAlign.value;
      const { arrowPosition, arrowOffset } = options;
      const notCenter = arrowPosition !== 'center',
        insetAlign = 'inset-' + inset + (notCenter ? arrowPosition : 'start'),
        reverseSide = insetReverseMap[side];
      return supportCSSAnchor && false
        ? ({
            positionAnchor: anchorName,
            position: 'fixed', // it must be fixed. According to the spec(https://drafts.csswg.org/css-anchor-position-1/#acceptable-anchor-element)
            ...(notCenter
              ? {
                  [side]: `anchor(${reverseSide})`,
                  [insetAlign]: `calc(anchor(${arrowPosition}) + ${toPxIfNum(arrowOffset)})`,
                }
              : {
                  insetArea: reverseSide,
                }),
          } as any as CSSProperties)
        : ({
            position: 'absolute',
            [insetAlign]: toPxIfNum(notCenter ? arrowOffset : x ?? y),
            [reverseSide]: toPxIfNum(-arrowSize),
          } satisfies CSSProperties);
    },
  };
}
