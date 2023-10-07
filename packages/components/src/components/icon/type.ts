import { ExtractPropTypes, PropType } from "vue";
import { IconLibraryValue, IconNameValue } from "./icon.default";

export const iconProps = {
  library: { type: String as PropType<IconLibraryValue>, },
  name: { type: String as PropType<IconNameValue>, required: true },
  autoClearCache: { type: Boolean },
}

export type IconProps = ExtractPropTypes<typeof iconProps>;