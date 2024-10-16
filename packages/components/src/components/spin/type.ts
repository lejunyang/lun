import { freeze } from '@lun/utils';
import {
  CommonProps,
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
export type SpinEvents = GetEventPropsFromEmits<typeof spinEmits>;
export type SpinProps = Partial<SpinSetupProps>;
