import { ExtractPropTypes } from "vue";
import { IconLibraryValue, IconNameValue } from "./icon.default";
import { PropString } from 'common';

export const iconProps = {
  library: PropString<IconLibraryValue>(),
  name: PropString<IconNameValue>(),
  autoClearCache: PropString(),
};

export type IconSetupProps = ExtractPropTypes<typeof iconProps>;
export type IconProps = Partial<IconSetupProps>;