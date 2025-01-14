import { ExtractPropTypes } from 'vue';
import { IconLibraryValue, IconNameValue } from './icon.default';
import { CommonProps, GetEventPropsFromEmits, PropString, themeProps } from 'common';
import { freeze } from '@lun-web/utils';

export const iconProps = freeze({
  library: PropString<IconLibraryValue>(),
  name: PropString<IconNameValue>(),
  autoClearCache: PropString(),
  status: themeProps.status,
});

export const iconEmits = freeze({});

export type IconSetupProps = ExtractPropTypes<typeof iconProps> & CommonProps;
export type IconEvents = GetEventPropsFromEmits<typeof iconEmits>;
export type IconProps = Partial<IconSetupProps> & IconEvents;
