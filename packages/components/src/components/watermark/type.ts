import { PropStrOrArr } from 'common';
import { ExtractPropTypes } from 'vue';

export const watermarkProps = {
  content: PropStrOrArr(),
};

export type WatermarkSetupProps = ExtractPropTypes<typeof watermarkProps>;
export type WatermarkProps = Partial<WatermarkSetupProps>;
