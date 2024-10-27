// derived from ant-design/components/watermark/useClips.ts

import { ComputedRef, computed, ref, watchEffect } from 'vue';
import { unrefOrGet, MaybeRefLikeOrGetter } from '../../utils/ref';
import { createElement, isHTMLImageElement, isPreferDark, ensureArray } from '@lun-web/utils';

export const FontGap = 3;

function prepareCanvas(
  width: number,
  height: number,
  ratio: number = 1,
): [ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, realWidth: number, realHeight: number] {
  const canvas = createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const realWidth = width * ratio;
  const realHeight = height * ratio;
  canvas.setAttribute('width', `${realWidth}px`);
  canvas.setAttribute('height', `${realHeight}px`);
  ctx.save();

  return [ctx, canvas, realWidth, realHeight];
}

/**
 * Get the clips of text content.
 * This is a lazy hook function since SSR no need this
 */
export function useWatermark(
  options: MaybeRefLikeOrGetter<
    {
      content?: string | string[] | null;
      image?: string | HTMLImageElement;
      opacity?: number;
      rotate?: number | string;
      ratio?: number;
      width?: number;
      height?: number;
      color?: CanvasFillStrokeStyles['fillStyle'];
      fontSize?: number | string;
      fontWeight?: 'normal' | 'light' | 'weight' | number;
      fontStyle?: 'none' | 'normal' | 'italic' | 'oblique';
      fontFamily?: string;
      textAlign?: CanvasTextAlign;
      gapX?: number;
      gapY?: number;
      imageProps?: Record<string, any>;
    },
    true
  >,
): ComputedRef<[dataURL: string, finalWidth: number, finalHeight: number, HTMLImageElement | undefined]> {
  let textCtx: CanvasRenderingContext2D;
  const imageRef = ref<HTMLImageElement>(),
    imageLoading = ref(false);
  watchEffect(() => {
    const { image } = unrefOrGet(options);
    if (isHTMLImageElement(image)) {
      imageRef.value = image;
    } else if (image && image !== 'none') {
      const imageEl = new Image();
      imageEl.crossOrigin = 'anonymous';
      imageEl.referrerPolicy = 'no-referrer';
      imageLoading.value = true;
      imageEl.onload = () => {
        imageLoading.value = false;
        imageRef.value = imageEl;
      };
      imageEl.onerror = () => {
        imageLoading.value = false;
      };
      imageEl.src = image;
    } else {
      imageRef.value = undefined;
    }
  });
  const size = computed(() => {
    let defaultWidth = 120;
    let defaultHeight = 64;
    let { width, height, fontSize = 16, fontFamily = 'sans-serif', content, imageProps } = unrefOrGet(options);
    if (imageRef.value) {
      return [imageProps?.width || defaultWidth, imageProps?.height || defaultHeight];
    }
    // ============================ Content =============================
    /**
     * Get the width and height of the watermark. The default values are as follows
     * Image: [120, 64]; Content: It's calculated by content;
     */
    if (!width || !height) {
      if (!textCtx) {
        const canvas = createElement('canvas');
        textCtx = canvas.getContext('2d')!;
      }
      if (textCtx.measureText) {
        textCtx.font = `${Number(fontSize)}px ${fontFamily}`;
        const contents = ensureArray(content);
        const sizes = contents.map((item) => {
          const metrics = textCtx.measureText(item!);
          return [metrics.width, metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent];
        });
        defaultWidth = Math.ceil(Math.max(...sizes.map((size) => size[0])));
        defaultHeight =
          Math.ceil(Math.max(...sizes.map((size) => size[1]))) * contents.length + (contents.length - 1) * FontGap;
      }
      width ||= defaultWidth;
      height ||= defaultHeight;
    }
    return [width, height];
  });

  return computed(() => {
    const renderImage = imageRef.value || imageLoading.value;
    let optionsVal = unrefOrGet(options);
    if (renderImage) optionsVal = { ...optionsVal, ...optionsVal.imageProps };
    let {
      content,
      opacity,
      rotate = -22,
      ratio = globalThis.devicePixelRatio || 1,
      color = isPreferDark() ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.15)',
      // color = 'rgba(0,0,0,.15)',
      fontSize = 16,
      fontWeight = 'normal',
      fontStyle = 'normal',
      fontFamily = 'sans-serif',
      textAlign = 'center',
      gapX = 100,
      gapY = 100,
    } = optionsVal;

    const [width, height] = size.value;

    // ================= Text / Image =================
    const [ctx, canvas, contentWidth, contentHeight] = prepareCanvas(width, height, ratio);
    opacity && (ctx.globalAlpha = opacity);
    if (renderImage) {
      // Image
      imageRef.value && ctx.drawImage(imageRef.value, 0, 0, contentWidth, contentHeight);
    } else {
      // Text
      const mergedFontSize = Number(fontSize) * ratio;

      ctx.font = `${fontStyle} normal ${fontWeight} ${mergedFontSize}px/${height}px ${fontFamily}`;
      ctx.fillStyle = color!;
      ctx.textAlign = textAlign!;
      ctx.textBaseline = 'top';
      const contents = ensureArray(content);
      contents.forEach((item, index) => {
        ctx.fillText(item ?? '', contentWidth / 2, index * (mergedFontSize + FontGap * ratio));
      });
    }

    // ==================== Rotate ====================
    const angle = (Math.PI / 180) * Number(rotate);
    const maxSize = Math.max(width, height);
    const [rCtx, rCanvas, realMaxSize] = prepareCanvas(maxSize, maxSize, ratio);

    // Copy from `ctx` and rotate
    rCtx.translate(realMaxSize / 2, realMaxSize / 2);
    rCtx.rotate(angle);
    if (contentWidth > 0 && contentHeight > 0) {
      rCtx.drawImage(canvas, -contentWidth / 2, -contentHeight / 2);
    }

    // Get boundary of rotated text
    function getRotatePos(x: number, y: number) {
      const targetX = x * Math.cos(angle) - y * Math.sin(angle);
      const targetY = x * Math.sin(angle) + y * Math.cos(angle);
      return [targetX, targetY];
    }

    let left = 0;
    let right = 0;
    let top = 0;
    let bottom = 0;

    const halfWidth = contentWidth / 2;
    const halfHeight = contentHeight / 2;
    const points = [
      [0 - halfWidth, 0 - halfHeight],
      [0 + halfWidth, 0 - halfHeight],
      [0 + halfWidth, 0 + halfHeight],
      [0 - halfWidth, 0 + halfHeight],
    ];
    points.forEach(([x, y]) => {
      const [targetX, targetY] = getRotatePos(x, y);
      left = Math.min(left, targetX);
      right = Math.max(right, targetX);
      top = Math.min(top, targetY);
      bottom = Math.max(bottom, targetY);
    });

    const cutLeft = left + realMaxSize / 2;
    const cutTop = top + realMaxSize / 2;
    const cutWidth = right - left;
    const cutHeight = bottom - top;

    // ================ Fill Alternate ================
    const realGapX = gapX * ratio;
    const realGapY = gapY * ratio;
    const filledWidth = (cutWidth + realGapX) * 2;
    const filledHeight = cutHeight + realGapY;

    const [fCtx, fCanvas] = prepareCanvas(filledWidth, filledHeight);

    function drawImg(targetX = 0, targetY = 0) {
      fCtx.drawImage(rCanvas, cutLeft, cutTop, cutWidth, cutHeight, targetX, targetY, cutWidth, cutHeight);
    }
    drawImg();
    drawImg(cutWidth + realGapX, -cutHeight / 2 - realGapY / 2);
    drawImg(cutWidth + realGapX, +cutHeight / 2 + realGapY / 2);

    return [fCanvas.toDataURL(), filledWidth / ratio, filledHeight / ratio, imageRef.value];
  });
}
