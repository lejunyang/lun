
import { iconEmits, IconProps, iconProps, defineIcon, iIcon } from '@lun/components';
import createComponent from '../createComponent';

export const LIcon = createComponent<IconProps, iIcon>('icon', defineIcon, iconProps, iconEmits);
if (__DEV__) LIcon.displayName = 'LIcon';
