import { assignProps, createLunElement, getFirstThemeProvider, toElement } from 'utils';
import { DialogProps, dialogProps } from './type';
import { HTMLAttributes, nextTick } from 'vue';
import { fromObject } from '@lun-web/utils';
import { iDialog } from './Dialog';
import { Status, renderStatusIcon } from 'common';
import { renderCustom } from '../custom-renderer';

const initialDialogProps = fromObject(dialogProps, (k) => [k, undefined]) as Record<
  keyof typeof dialogProps,
  undefined
>;

export type DialogStaticMethodParams = Omit<DialogProps, 'open'> & {
  destroyOnClose?: boolean;
  getContainer?: () => Element | string;
} & { style?: string | Partial<CSSStyleDeclaration> } & Omit<HTMLAttributes, 'style' | 'title'>;

const createStatusMethod = (status: Status) => {
  return ({ header, content, ...others }: DialogStaticMethodParams = {}) =>
    methods.open({
      ...others,
      isConfirm: true,
      header: (
        <>
          {header && renderStatusIcon(status)}
          {header}
        </>
      ),
      content: (
        <>
          {renderStatusIcon(status, { style: { visibility: header ? 'hidden' : 'visible' } })}
          <div part="confirm-content">{renderCustom(content)}</div>
        </>
      ),
      noCancelBtn: true,
      noCloseBtn: true,
    });
};

const existSet = new Set<iDialog>();

export const methods = {
  open({ getContainer, destroyOnClose = true, ...props }: DialogStaticMethodParams = {}) {
    let container: Element | null = null;
    const args = [
      props,
      {
        open: undefined,
        onAfterClose() {
          if (destroyOnClose) {
            dialog.remove();
            existSet.delete(dialog);
          }
        },
      },
    ];

    container = (getContainer && toElement(getContainer())) || getFirstThemeProvider() || document.body;
    const dialog = createLunElement('dialog') as iDialog;

    if (!destroyOnClose) {
      args.unshift(initialDialogProps); // add initial props so that previous props will be reset
    }
    assignProps(dialog, ...args);
    if (container) {
      container.append(dialog);
      existSet.add(dialog);
      nextTick(dialog.openDialog);
    }
    return dialog;
  },
  success: createStatusMethod('success'),
  error: createStatusMethod('error'),
  warning: createStatusMethod('warning'),
  info: createStatusMethod('info'),
  /**
   * Destroy all opening dialogs opened by static methods.
   * Remind that this will not trigger close or afterClose event.
   */
  destroyAll() {
    for (const dialog of existSet) {
      dialog.remove();
    }
    existSet.clear();
  },
  /**
   * Close all opening dialogs opened by static methods.
   */
  async closeAll() {
    for (const dialog of existSet) {
      await dialog.closeDialog();
    }
  },
};
