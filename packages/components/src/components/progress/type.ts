import { PropNumber, PropString, themeProps } from 'common';
import { ExtractPropTypes } from 'vue';

export const progressProps = {
  ...themeProps,
  value: PropNumber(),
  type: PropString<'wave'>(),
};

export type ProgressSetupProps = ExtractPropTypes<typeof progressProps>;
export type ProgressProps = Partial<ProgressSetupProps>;
