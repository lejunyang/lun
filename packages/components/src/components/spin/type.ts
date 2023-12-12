import { Responsive } from "@lun/core";
import { ExtractPropTypes, PropType } from "vue";

export const spinProps = {
  type: { type: String as PropType<'circle'> },
  strokeWidth: { type: [Number, String] },
  size: { type: [String, Object] as PropType<Responsive<'1' | '2' | '3'>> },
  delay: { type: Number },
};

export type SpinSetupProps = ExtractPropTypes<typeof spinProps>;
export type SpinProps = Partial<SpinSetupProps>;