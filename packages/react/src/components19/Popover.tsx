import { definePopover, PopoverProps, iPopover } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LPopover = createComponent<PopoverProps, iPopover>('popover', definePopover);
if (__DEV__) LPopover.displayName = 'LPopover';
