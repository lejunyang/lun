import { defineDialog, DialogProps, iDialog } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LDialog = createComponent<DialogProps, iDialog>('dialog', defineDialog);
if (__DEV__) LDialog.displayName = 'LDialog';
