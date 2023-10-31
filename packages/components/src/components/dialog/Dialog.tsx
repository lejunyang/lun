import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { dialogProps } from './type';
import { useCEExpose, useNamespace, useOpenModel } from 'hooks';
import { defineButton } from '../button';
import { defineSpin } from '../spin/Spin';
import { defineCustomRenderer } from '../custom-renderer';
import { defineIcon } from '../icon/Icon';
import { useNativeDialog, useSetupEdit } from '@lun/core';
import { computed, ref, watchEffect } from 'vue';

const name = 'dialog';
export const Dialog = defineSSRCustomElement({
  name,
  props: dialogProps,
  emits: ['update', 'open', 'close'],
  setup(props) {
    const ns = useNamespace(name);
    const openModel = useOpenModel(props, { passive: true });
    const dialogRef = ref<HTMLDialogElement>();
    const [editComputed, editState] = useSetupEdit({
      noInherit: true,
    });
    const { dialogHandlers, methods } = useNativeDialog(
      computed(() => ({
        ...props,
        native: props.modal === 'native',
        isOpen: openModel.value,
        open() {
          if (dialogRef.value) {
            openModel.value = true;
            dialogRef.value.showModal();
          }
        },
        close() {
          if (dialogRef.value) {
            openModel.value = false;
            dialogRef.value.close();
          }
        },
        isPending: !editComputed.value.editable,
        onPending(pending) {
          editState.disabled = pending;
        },
      }))
    );
    watchEffect(() => {
      if (dialogRef.value) {
        if (openModel.value) methods.open();
        else methods.close();
      }
    });

    useCEExpose({
      openDialog: methods.open,
      closeDialog: methods.close,
      toggleDialog: methods.toggle,
    });
    return () => {
      return (
        <dialog class={[ns.b()]} part="dialog" ref={dialogRef} {...dialogHandlers}>
          {!props.noHeader && (
            <header class={[ns.e('header')]} part="header">
              <slot name="header-start"></slot>
              <slot name="header">{props.headerTitle}</slot>
              <slot name="header-end">
                {props.closeBtn &&
                  renderElement(
                    'button',
                    { ...props.closeBtnProps, asyncHandler: methods.close },
                    renderElement('icon', { name: 'x', slot: 'icon' })
                  )}
              </slot>
            </header>
          )}
          <div class={[ns.e('content')]} part="content">
            <slot>{props.content && renderElement('custom-renderer', { content: props.content })}</slot>
          </div>
          {!props.noFooter && (
            <footer class={[ns.e('footer')]} part="footer">
              <slot name="footer-start"></slot>
              <slot name="footer">
                {props.cancelBtn &&
                  renderElement('button', {
                    ...props.cancelBtnProps,
                    label: props.cancelText,
                    asyncHandler: methods.close,
                  })}
                {props.okBtn &&
                  renderElement('button', { ...props.okBtnProps, label: props.okText, asyncHandler: methods.ok })}
              </slot>
              <slot name="footer-end"></slot>
            </footer>
          )}
        </dialog>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LDialog: typeof Dialog;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-dialog': typeof Dialog;
  }
}

export const defineDialog = createDefineElement(name, Dialog, {
  spin: defineSpin,
  icon: defineIcon,
  button: defineButton,
  'custom-renderer': defineCustomRenderer,
});
