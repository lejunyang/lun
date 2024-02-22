import { PropNumber, PropObjOrStr, PropStrOrArr, PropString } from 'common';
import { ExtractPropTypes } from 'vue';

export const watermarkProps = {
  content: PropStrOrArr(),
  image: PropString(),
  rotate: PropNumber(),
  ratio: PropNumber(),
  width: PropNumber(),
  height: PropNumber(),
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
};

export type WatermarkSetupProps = ExtractPropTypes<typeof watermarkProps>;
export type WatermarkProps = Partial<WatermarkSetupProps>;
