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
  arrowPosition?: 'start' | 'end' | 'center' | 'auto';
  arrowOffset?: number | string;
}) {
  const { name, inner, off, offset, placement } = options;
  const isOn = computed(() => unrefOrGet(name) && supportCSSAnchor && !unrefOrGet(off));
  const info = computed(() => {
    const [side, align] = (unrefOrGet(placement) || 'bottom').split('-'),
      inline = side === 'top' || side === 'bottom';
    return [side, align, inline ? 'inline-' : 'block-', inline ? 'width' : 'height'] as const;
  });
  const anchorName = '--p'; // it's for arrow element, always turn on anchor position for arrow element if supports
  const defaultSize = { width: Infinity, height: Infinity };
  return {
    isOn,
    render() {
      return isOn.value && unrefOrGet(inner) && <style>{`:host{anchor-name:${unrefOrGet(name)}}`}</style>;
    },
    popStyle(fallbackStyles: any) {
      const [side, align, inset] = info.value;
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
    arrowStyle(
      x?: number,
      y?: number,
      arrowSize = 0,
      { reference, floating } = { reference: defaultSize, floating: defaultSize },
    ) {
      const [side, align, inset, sizeProp] = info.value;
      const { arrowPosition, arrowOffset } = options;
      const isAuto = arrowPosition === 'auto' || !arrowPosition,
        isCenter = arrowPosition === 'center' || (isAuto && !align),
        finalAlign = isCenter || isAuto ? align || 'start' : arrowPosition,
        insetAlign = 'inset-' + inset + finalAlign,
        reverseSide = insetReverseMap[side];
      let finalArrowOffset =
        isAuto && !isCenter
          ? Math.min(+arrowOffset!, (reference[sizeProp] - arrowSize) / 2, (floating[sizeProp] - arrowSize) / 2)
          : arrowOffset;
      if ((finalArrowOffset as number) < 0) finalArrowOffset = arrowOffset;
      return supportCSSAnchor
        ? ({
            positionAnchor: anchorName,
            position: 'fixed', // it must be fixed. According to the spec(https://drafts.csswg.org/css-anchor-position-1/#acceptable-anchor-element)
            ...(isCenter
              ? {
                  insetArea: reverseSide,
                }
              : {
                  [side]: `anchor(${reverseSide})`,
                  [insetAlign]: `calc(anchor(${finalAlign}) + ${toPxIfNum(finalArrowOffset)})`,
                }),
          } as any as CSSProperties)
        : ({
            position: 'absolute',
            [insetAlign]: toPxIfNum(isCenter ? x ?? y : finalArrowOffset),
            [reverseSide]: toPxIfNum(-arrowSize),
          } satisfies CSSProperties);
    },
  };
}
