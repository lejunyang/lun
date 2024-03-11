import { getElementFirstName, getFirstThemeProvider, toElement } from 'utils';
import { DialogProps, dialogProps } from './type';
import { mergeProps } from 'vue';
import { objectKeys } from '@lun/utils';
import { iDialog } from './Dialog';
import { Status, renderStatusIcon } from 'common';
import { VCustomRenderer } from '../custom-renderer';

let commonDialog: iDialog;
const initialDialogProps = objectKeys(dialogProps).reduce((acc, key) => {
  acc[key] = undefined;
  return acc;
}, {} as Record<keyof typeof dialogProps, undefined>);

export type DialogStaticMethodParams = Omit<DialogProps, 'open'> & {
  destroyOnClose?: boolean;
  getContainer?: () => Element | string;
};

const createStatusMethod = (status: Status) => {
  return ({ title, content, contentType, contentPreferHtml, ...others }: DialogStaticMethodParams = {}) =>
    methods.open({
      ...others,
      isConfirm: true,
      title: (
        <>
          {renderStatusIcon(status)}
          {title}
        </>
      ),
      contentType: 'vnode',
      content: (
        <>
          {renderStatusIcon(status, { style: { visibility: title ? 'hidden' : 'visible' } })}
          <div part="confirm-content">
            {content && <VCustomRenderer content={content} type={contentType} preferHtml={contentPreferHtml} />}
          </div>
        </>
      ),
      noHeader: !title,
      noCancelBtn: true,
      noCloseBtn: true,
    });
};

const openSet = new Set<iDialog>();

export const methods = {
  open({ getContainer, destroyOnClose, ...props }: DialogStaticMethodParams = {}) {
    let dialog = destroyOnClose ? null : commonDialog;
    let container: Element | null = null;
    const args = [
      props,
      {
        open: undefined,
        onAfterClose() {
          if (destroyOnClose) {
            dialog?.remove();
            openSet.delete(dialog!);
          }
        },
      },
    ];
    if (!dialog || !dialog.isConnected) {
      container = (getContainer && toElement(getContainer())) || getFirstThemeProvider() || document.body;
      const dialogName = getElementFirstName('dialog')!;
      if (__DEV__ && !dialogName) throw new Error('dialog component is not registered, please register it first.');
      dialog = document.createElement(dialogName) as iDialog;
    }
    if (!destroyOnClose) {
      commonDialog = dialog;
      args.unshift(initialDialogProps); // add initial props so that previous props will be reset
    }
    Object.assign(dialog, mergeProps(...args));
    container && container.append(dialog);
    dialog.openDialog();
    openSet.add(dialog);
    return dialog;
  },
  success: createStatusMethod('success'),
  error: createStatusMethod('error'),
  warning: createStatusMethod('warning'),
  info: createStatusMethod('info'),
  destroyAll() {
    for (const dialog of openSet) {
      dialog.remove(); // just remove, not triggering close event
    }
    openSet.clear();
  },
};
