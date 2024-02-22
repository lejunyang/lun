import { PropBoolean, PropNumber, PropObjOrStr, PropStrOrArr, PropString } from 'common';
import { ExtractPropTypes } from 'vue';

export const watermarkProps = {
  content: PropStrOrArr(),
  /** image src or image element, could also be 'none' */
  image: PropObjOrStr<string | HTMLImageElement>(),
  opacity: PropNumber(),
  rotate: PropNumber(),
  ratio: PropNumber(),
  width: PropNumber(),
  height: PropNumber(),
  zIndex: PropNumber(),
  color: PropObjOrStr<CanvasFillStrokeStyles['fillStyle']>(),
  fontSize: PropNumber(),
  fontWeight: PropNumber<'normal' | 'light' | 'weight' | number>(),
  fontStyle: PropString<'none' | 'normal' | 'italic' | 'oblique'>(),
  fontFamily: PropString(),
  textAlign: PropString<CanvasTextAlign>(),
  gapX: PropNumber(),
  gapY: PropNumber(),
  offsetX: PropNumber(),
  offsetY: PropNumber(),
  /** dialog will inherit parent watermark and render it by default */
  noInherit: PropBoolean(),
  /** useful when it's a child of another watermark, avoid recreating watermark */
  reuse: PropBoolean(),
};

export type WatermarkSetupProps = ExtractPropTypes<typeof watermarkProps>;
export type WatermarkProps = Partial<WatermarkSetupProps>;
