import { freeze } from '@lun/utils';
import { CommonProps, GetEventPropsFromEmits, PropBoolean, PropNumber, PropString, themeProps } from 'common';
import { ExtractPropTypes } from 'vue';

export const spinProps = freeze({
  ...themeProps,
  type: PropString<'circle'>(),
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
