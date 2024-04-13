import { AppearanceColor } from 'hooks';
import {
  GetEventPropsFromEmits,
  PropBoolean,
  PropNumber,
  PropObjOrStr,
  PropObject,
  PropStrOrArr,
  PropString,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { freeze } from '@lun/utils';

export const watermarkProps = freeze({
  content: PropStrOrArr(),
  /** image src or image element, could also be 'none' */
  image: PropObjOrStr<string | HTMLImageElement>(),
  /** watermark options for image, it's to distinguish text and image props */
  imageProps: PropObject(),
  opacity: PropNumber(),
  rotate: PropNumber(),
  ratio: PropNumber(),
  width: PropNumber(),
  height: PropNumber(),
  zIndex: PropNumber(),
  color: PropObjOrStr<AppearanceColor<CanvasFillStrokeStyles['fillStyle']>>(),
  fontSize: PropNumber(),
  fontWeight: PropNumber<'normal' | 'light' | 'weight' | number>(),
  fontStyle: PropString<'none' | 'normal' | 'italic' | 'oblique'>(),
  fontFamily: PropString(),
  textAlign: PropString<CanvasTextAlign>(),
  gapX: PropNumber(),
  gapY: PropNumber(),
  /** number or 'half-gap' */
  offsetLeft: PropNumber(),
  /** number or 'half-gap' */
  offsetTop: PropNumber(),
  /** dialog inherits parent watermark and renders it by default */
  noInherit: PropBoolean(),
  /** useful when it's a child of another watermark, avoid recreating watermark */
  reuse: PropBoolean(),
  /** used to make the props of watermark mutable, note that it can not be dynamically changed, only valid when it's set before mount */
  mutable: PropBoolean(),
});

export const watermarkEmits = freeze({});

export type WatermarkSetupProps = ExtractPropTypes<typeof watermarkProps>;
export type WatermarkEvents = GetEventPropsFromEmits<typeof watermarkEmits>;
export type WatermarkProps = Partial<WatermarkSetupProps>;
