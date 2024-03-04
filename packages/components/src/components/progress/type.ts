import { PropBoolean, PropNumber, PropString, Status, themeProps } from 'common';
import { ExtractPropTypes } from 'vue';

export const progressProps = {
  ...themeProps,
  value: PropNumber(),
  type: PropString<'wave' | 'ring' | 'line' | 'steps'>(),
  noPercent: PropBoolean(),
  status: PropString<Status>(),
  strokeColor: PropString(),
  trailerColor: PropString(),
  width: PropNumber(),
  height: PropNumber(),
};

export type ProgressSetupProps = ExtractPropTypes<typeof progressProps>;
export type ProgressProps = Partial<ProgressSetupProps>;
