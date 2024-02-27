import { getElementFirstName, getFirstThemeProvider, toElement } from 'utils';
import { DialogProps, dialogProps } from './type';
import { mergeProps } from 'vue';
import { objectKeys } from '@lun/utils';
import { iDialog } from './Dialog';

let commonDialog: iDialog;
const initialDialogProps = objectKeys(dialogProps).reduce((acc, key) => {
  acc[key] = undefined;
  return acc;
}, {} as Record<keyof typeof dialogProps, undefined>);

export const methods = {
  open({
    getContainer,
    destroyOnClose,
    ...props
  }: Omit<DialogProps, 'open'> & { destroyOnClose?: boolean; getContainer?: () => Element | string } = {}) {
    let dialog = destroyOnClose ? null : commonDialog;
    if (!commonDialog || !commonDialog.isConnected) {
      const container = (getContainer && toElement(getContainer())) || getFirstThemeProvider() || document.body;
      const dialogName = getElementFirstName('dialog')!;
      if (__DEV__ && !dialogName) throw new Error('dialog component is not registered, please register it first.');
      dialog = document.createElement(dialogName) as iDialog;

      const args = [
        props,
        {
          open: undefined,
          onClose() {
            if (destroyOnClose) dialog?.remove();
          },
        },
      ];
      if (!destroyOnClose) {
        commonDialog = dialog;
        args.unshift(initialDialogProps); // add initial props so that previous props will be reset
      }
      Object.assign(dialog, mergeProps(...args));
      container.append(dialog);
      dialog.openDialog();
      return dialog;
    }
  },
};
