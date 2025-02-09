import { freeze } from '@lun-web/utils';
import {
  CommonProps,
  createEmits,
  GetEventMapFromEmits,
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

export const progressEmits = createEmits<{
  done: undefined;
}>(['done']);

export type ProgressSetupProps = ExtractPropTypes<typeof progressProps> & CommonProps;
export type ProgressEventProps = GetEventPropsFromEmits<typeof progressEmits>;
export type ProgressEventMap = GetEventMapFromEmits<typeof progressEmits>;
export type ProgressProps = Partial<ProgressSetupProps> & ProgressEventProps;
