import { PropNumber, PropStrOrArr, PropString } from 'common';
import { ExtractPropTypes } from 'vue';

export const watermarkProps = {
  content: PropStrOrArr(),
  image: PropString(),
  rotate: PropNumber(),
  ratio: PropNumber(),
  width: PropNumber(),
  height: PropNumber(),
  color: PropString(),
  fontSize: PropNumber(),
  fontWeight: PropString(),
  fontStyle: PropString(),
  fontFamily: PropString(),
  textAlign: PropString(),
  gapX: PropNumber(),
  gapY: PropNumber(),
};

export type WatermarkSetupProps = ExtractPropTypes<typeof watermarkProps>;
export type WatermarkProps = Partial<WatermarkSetupProps>;
