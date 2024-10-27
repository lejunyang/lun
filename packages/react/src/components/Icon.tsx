
import { iconEmits, IconProps, iconProps, defineIcon, iIcon } from '@lun-web/components';
import createComponent from '../createComponent';

export const LIcon = createComponent<IconProps, iIcon>('icon', defineIcon, iconProps, iconEmits);
if (__DEV__) LIcon.displayName = 'LIcon';
