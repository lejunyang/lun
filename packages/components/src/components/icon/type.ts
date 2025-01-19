import { ExtractPropTypes } from 'vue';
import { IconLibraryValue, IconNameValue } from './icon.default';
import { CommonProps, GetEventMapFromEmits, GetEventPropsFromEmits, PropString, themeProps } from 'common';
import { freeze } from '@lun-web/utils';

export const iconProps = freeze({
  library: PropString<IconLibraryValue>(),
  name: PropString<IconNameValue>(),
  autoClearCache: PropString(),
  status: themeProps.status,
});

export const iconEmits = freeze({});

export type IconSetupProps = ExtractPropTypes<typeof iconProps> & CommonProps;
export type IconEventProps = GetEventPropsFromEmits<typeof iconEmits>;
export type IconEventMap = GetEventMapFromEmits<typeof iconEmits>;
export type IconProps = Partial<IconSetupProps> & IconEventProps;
