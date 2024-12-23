import { MaybeRefLikeOrGetter, unrefOrGet } from '@lun-web/core';
import { supportCSSAnchor, toPxIfNum } from '@lun-web/utils';
import { popSupport } from 'common';
import { computed, ComputedRef, CSSProperties } from 'vue';

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
  strategy?: 'absolute' | 'fixed';
  type?: MaybeRefLikeOrGetter<keyof typeof popSupport>;
  info: ComputedRef<readonly [string, string, 'inline-' | 'block-', 'width' | 'height', 'x' | 'y']>;
}) {
  const { name, inner, off, offset, type, info } = options;
  const isOn = computed(() => unrefOrGet(name) && supportCSSAnchor && !unrefOrGet(off));
  return {
    /** whether anchor position is on */
    isOn,
    /** render extra style for anchor position */
    render() {
      return (
        isOn.value &&
        unrefOrGet(inner) && (
          <style>{`:host{${
            // according to the spec(https://drafts.csswg.org/css-anchor-position-1/#acceptable-anchor-element)
            // when it's 'normal' type, 'absolute' strategy will break the first rule, and then anchor positioning is not working
            `position:${unrefOrGet(type) === 'normal' && options.strategy !== 'fixed' ? 'static' : 'relative'};`
          }anchor-name:${unrefOrGet(name)}}`}</style>
        )
      );
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
            // was inset-area before, then spec changed it to position-area, setting both
            insetArea,
            positionArea: insetArea,
            [insetReverseMap[side] || 'top']: toPxIfNum(unrefOrGet(offset) || 0),
            position: options.strategy || 'absolute',
            width: processPopSize(popWidth, true),
            height: processPopSize(popHeight, true),
          } as any as CSSProperties)
        : fallbackStyles;
    },
  };
}
