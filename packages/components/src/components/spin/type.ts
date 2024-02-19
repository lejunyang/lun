import { PropBoolean, PropNumber, PropString, themeProps } from "common";
import { ExtractPropTypes } from "vue";

export const spinProps = {
  ...themeProps,
  type: PropString<'circle'>(),
  strokeWidth: PropNumber(),
  spinning: PropBoolean(),
  delay: PropNumber(),
  asContainer: PropBoolean(),
  tip: PropString(),
};

export type SpinSetupProps = ExtractPropTypes<typeof spinProps>;
export type SpinProps = Partial<SpinSetupProps>;