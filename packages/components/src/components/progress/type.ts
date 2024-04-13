import { freeze } from '@lun/utils';
import { CommonProps, GetEventPropsFromEmits, PropBoolean, PropNumber, PropString, Status, themeProps } from 'common';
import { ExtractPropTypes } from 'vue';

export const progressProps = freeze({
  ...themeProps,
  value: PropNumber(),
  type: PropString<'wave' | 'ring' | 'line' | 'steps'>(),
  noPercent: PropBoolean(),
  status: PropString<Status>(),
  showStatusIcon: PropBoolean(),
  strokeColor: PropString(),
  trailerColor: PropString(),
  width: PropNumber(),
  height: PropNumber(),
});

export const progressEmits = freeze({});

export type ProgressSetupProps = ExtractPropTypes<typeof progressProps> & CommonProps;
export type ProgressEvents = GetEventPropsFromEmits<typeof progressEmits>;
export type ProgressProps = Partial<ProgressSetupProps>;
