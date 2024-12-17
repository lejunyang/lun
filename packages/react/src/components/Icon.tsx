import { iconEmits, iconProps, defineIcon, IconProps, iIcon } from '@lun-web/components';
import createComponent from '../createComponent';

export const LIcon = createComponent<IconProps, iIcon>('icon', defineIcon, iconProps, iconEmits);
if (__DEV__) LIcon.displayName = 'LIcon';
