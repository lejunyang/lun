import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { dialogProps } from './type';
import { useCEExpose, useNamespace, useOpenModel } from 'hooks';
import { defineButton } from '../button';
import { defineSpin } from '../spin/Spin';
import { VCustomRenderer } from '../custom-renderer';
import { defineIcon } from '../icon/Icon';
import { useNativeDialog, useSetupEdit } from '@lun/core';
import { Transition, computed, ref, watch } from 'vue';

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
        native: props.modal === 'native', // TODO remove
        isOpen: openModel.value,
        open() {
          if (dialogRef.value) {
            dialogRef.value.showModal();
            openModel.value = true;
          }
        },
        close() {
          if (dialogRef.value) {
            openModel.value = false;
          }
        },
        isPending: !editComputed.value.editable,
        onPending(pending) {
          editState.disabled = pending;
        },
      }))
    );

    watch([openModel, dialogRef], ([open, dialog]) => {
      if (dialog) {
        if (open) methods.open();
        else methods.close();
      }
    });

    const onAfterLeave = () => dialogRef.value?.close();

    useCEExpose({
      openDialog: methods.open,
      closeDialog: methods.close,
      toggleDialog: methods.toggle,
    });
    return () => {
      return (
        <dialog
          class={[...ns.t]}
          part={ns.p('root')}
          ref={dialogRef}
          {...dialogHandlers}
          style={{ width: props.width }}
        >
          <Transition name="dialog-overlay">
            <div v-show={openModel.value} class={[ns.e('overlay')]} part={ns.p('overlay')} tabindex={-1}></div>
          </Transition>
          <Transition name="dialog-panel" onAfterLeave={onAfterLeave}>
            <div v-show={openModel.value} class={ns.e('panel')} part={ns.p('panel')}>
              {props.closeBtn &&
                renderElement(
                  'button',
                  {
                    class: ns.e('close'),
                    variant: 'ghost',
                    ...props.closeBtnProps,
                    asyncHandler: methods.close,
                    part: ns.p('close'),
                  },
                  renderElement('icon', { name: 'x', slot: 'icon' })
                )}
              {!props.noHeader && (
                <header class={[ns.e('header')]} part={ns.p('header')}>
                  <slot name="header-start"></slot>
                  <slot name="header">{props.headerTitle}</slot>
                  <slot name="header-end"></slot>
                </header>
              )}
              <div class={[ns.e('content')]} part={ns.p('content')}>
                <slot>{props.content && <VCustomRenderer content={props.content} />}</slot>
              </div>
              {!props.noFooter && (
                <footer class={[ns.e('footer')]} part={ns.p('footer')}>
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
            </div>
          </Transition>
        </dialog>
      );
    };
  },
});

export type tDialog = typeof Dialog;

export const defineDialog = createDefineElement(name, Dialog, {
  spin: defineSpin,
  icon: defineIcon,
  button: defineButton,
});
