import { freeze } from '@lun/utils';
import {
  CommonProps,
  GetEventPropsFromEmits,
  PropBoolean,
  PropNumber,
  PropObject,
  PropString,
  Status,
  themeProps,
} from 'common';
import { CSSProperties, ExtractPropTypes } from 'vue';

export const progressProps = freeze({
  ...themeProps,
  value: PropNumber(),
  type: PropString<'wave' | 'ring' | 'line' | 'steps' | 'page-top'>(),
  noPercent: PropBoolean(),
  status: PropString<Status>(),
  showStatusIcon: PropBoolean(),
  strokeColor: PropString(),
  trailerColor: PropString(),
  width: PropNumber(),
  height: PropNumber(),
  trailerStyle: PropObject<CSSProperties>(),
  strokeStyle: PropObject<CSSProperties>(),
});

export const progressEmits = freeze({
  done: null,
});

export type ProgressSetupProps = ExtractPropTypes<typeof progressProps> & CommonProps;
export type ProgressEvents = GetEventPropsFromEmits<typeof progressEmits>;
export type ProgressProps = Partial<ProgressSetupProps>;
