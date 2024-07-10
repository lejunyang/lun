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

export function processPopSize(size?: string | number, addAnchorSize?: boolean) {
  switch (size) {
    case 'anchorWidth':
      return addAnchorSize ? 'anchor-size(width)' : 'width';
    case 'anchorHeight':
      return addAnchorSize ? 'anchor-size(height)' : 'height';
    default:
      return toPxIfNum(size);
  }
}

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
      // if side is top or bottom, the arrow's position needs to be inline; otherwise, it's block
      inline = side === 'top' || side === 'bottom';
    return [side, align, inline ? 'inline-' : 'block-', inline ? 'width' : 'height', inline ? 'x' : 'y'] as const;
  });
  const defaultSize = { width: Infinity, height: Infinity };
  return {
    /** whether anchor position is on */
    isOn,
    /** render extra style for anchor position */
    render() {
      return isOn.value && unrefOrGet(inner) && <style>{`:host{anchor-name:${unrefOrGet(name)}}`}</style>;
    },
    popStyle(fallbackStyles: any, popWidth?: string | number, popHeight?: string | number) {
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
            width: processPopSize(popWidth, true),
            height: processPopSize(popHeight, true),
          } as any as CSSProperties)
        : fallbackStyles;
    },
    arrowStyle(
      arrowSize = 0,
      { reference, floating } = { reference: defaultSize, floating: defaultSize },
      shift?: { x: number; y: number },
    ) {
      const [side, align, inset, sizeProp, axis] = info.value;
      const { arrowPosition, arrowOffset } = options;
      const shiftSize = shift?.[axis];
      const isAuto = arrowPosition === 'auto' || !arrowPosition,
        isCenter = arrowPosition === 'center' || (isAuto && !align),
        finalAlign = isCenter || isAuto ? align || 'start' : arrowPosition,
        insetAlign = 'inset-' + inset + finalAlign;
      let finalArrowOffset =
        isAuto && !isCenter
          ? Math.min(+arrowOffset!, (reference[sizeProp] - arrowSize) / 2, (floating[sizeProp] - arrowSize) / 2)
          : arrowOffset;
      if ((finalArrowOffset as number) < 0) finalArrowOffset = arrowOffset;
      return {
        position: 'absolute',
        [insetAlign]: isCenter ? '50%' : toPxIfNum(finalArrowOffset),
        [side]: '100%',
        [insetReverseMap[side]]: '', // must set empty value for the other side. because 'flip' can happen, side can change to top from bottom. due to vue style update logic, original 'bottom' will not be removed unless we specify it
        transform: isCenter
          ? `translate${axis.toUpperCase()}(${shiftSize ? `calc(-50% + (${-shiftSize}px))` : '-50%'})`
          : '',
      } satisfies CSSProperties;
      // remove this code, CSS Anchor Position doesn't work well for arrow element, as the position will be wrong when transform: scale transition taking effect
      // also, we don't need to use arrow plugin of floating-ui
      // const reverseSide = insetReverseMap[side];
      // return supportCSSAnchor
      //   ? ({
      //       positionAnchor: anchorName,
      //       position: 'fixed', // it must be fixed. According to the spec(https://drafts.csswg.org/css-anchor-position-1/#acceptable-anchor-element)
      //       ...(isCenter
      //         ? {
      //             insetArea: reverseSide,
      //           }
      //         : {
      //             [side]: `anchor(${reverseSide})`,
      //             [insetAlign]: `calc(anchor(${finalAlign}) + ${toPxIfNum(finalArrowOffset)})`,
      //           }),
      //     } as any as CSSProperties)
      //   : ({
      //       position: 'absolute',
      //       [insetAlign]: toPxIfNum(isCenter ? x ?? y : finalArrowOffset),
      //       [reverseSide]: toPxIfNum(-arrowSize),
      //     } satisfies CSSProperties);
    },
  };
}
