
import { popoverEmits, PopoverProps, popoverProps, definePopover, iPopover } from '@lun/components';
import createComponent from '../createComponent';

export const LPopover = createComponent<PopoverProps, iPopover>('popover', definePopover, popoverProps, popoverEmits);
if (__DEV__) LPopover.displayName = 'LPopover';
