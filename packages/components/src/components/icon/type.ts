import { ExtractPropTypes } from 'vue';
import { IconLibraryValue, IconNameValue } from './icon.default';
import { CommonProps, GetEventPropsFromEmits, PropString } from 'common';
import { freeze } from '@lun/utils';

export const iconProps = freeze({
  library: PropString<IconLibraryValue>(),
  name: PropString<IconNameValue>(),
  autoClearCache: PropString(),
});

export const iconEmits = freeze({});

export type IconSetupProps = ExtractPropTypes<typeof iconProps> & CommonProps;
export type IconEvents = GetEventPropsFromEmits<typeof iconEmits>;
export type IconProps = Partial<IconSetupProps> & IconEvents;
