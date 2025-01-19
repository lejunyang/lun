import { freeze } from '@lun-web/utils';
import {
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  PropBoolean,
  PropNumber,
  PropObjOrStr,
  PropString,
  themeProps,
} from 'common';
import { CSSProperties, ExtractPropTypes } from 'vue';

export const spinProps = freeze({
  ...themeProps,
  type: PropString<'circle'>(),
  svgStyle: PropObjOrStr<CSSProperties | string>(),
  strokeWidth: PropNumber(),
  spinning: PropBoolean(),
  delay: PropNumber(),
  asContainer: PropBoolean(),
  tip: PropString(),
});

export const spinEmits = freeze({});

export type SpinSetupProps = ExtractPropTypes<typeof spinProps> & CommonProps;
export type SpinEventProps = GetEventPropsFromEmits<typeof spinEmits>;
export type SpinEventMap = GetEventMapFromEmits<typeof spinEmits>;
export type SpinProps = Partial<SpinSetupProps> & SpinEventProps;
