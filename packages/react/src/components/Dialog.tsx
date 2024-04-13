
import { dialogEmits, DialogProps, dialogProps, defineDialog, iDialog } from '@lun/components';
import createComponent from '../createComponent';

export const LDialog = createComponent<DialogProps, iDialog>('dialog', defineDialog, dialogProps, dialogEmits);
if (__DEV__) LDialog.displayName = 'LDialog';
