import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { dialogEmits, dialogProps } from './type';
import { useCEExpose, useNamespace, useOpenModel } from 'hooks';
import { defineButton } from '../button';
import { defineSpin } from '../spin/Spin';
import { VCustomRenderer } from '../custom-renderer';
import { defineIcon } from '../icon/Icon';
import { useNativeDialog, useSetupEdit } from '@lun/core';
import { Transition, computed, ref, watch } from 'vue';
import { getTransitionProps, intl } from 'common';

const name = 'dialog';
export const Dialog = defineSSRCustomElement({
  name,
  props: dialogProps,
  emits: dialogEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const openModel = useOpenModel(props, { passive: true });
    const dialogRef = ref<HTMLDialogElement>();
    const [editComputed, editState] = useSetupEdit({
      noInherit: true,
    });
    const pending = ref(false);
    const { dialogHandlers, methods } = useNativeDialog(
      computed(() => {
        return {
          ...props,
          native: props.modal === 'native', // TODO
          isOpen: openModel.value,
          open() {
            if (dialogRef.value) {
              // TODO modal modal={false}
              dialogRef.value.showModal();
              openModel.value = true;
            }
          },
          close() {
            if (dialogRef.value) {
              openModel.value = false;
            }
          },
          isPending: !editComputed.value.editable || pending.value,
          onPending(_pending) {
            pending.value = _pending;
            if (props.disabledAllWhenPending) editState.disabled = _pending;
          },
        };
      }),
    );

    watch([openModel, dialogRef], ([open, dialog]) => {
      if (dialog) {
        if (open) methods.open();
        else methods.close();
      }
    });

    const panelTransitionHandlers = {
      onAfterEnter() {
        emit('afterOpen');
      },
      onAfterLeave() {
        dialogRef.value?.close();
        emit('afterClose');
      },
    };

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
          <Transition {...getTransitionProps(props, 'overlay')}>
            <div v-show={openModel.value} class={[ns.e('overlay')]} part={ns.p('overlay')} tabindex={-1}></div>
          </Transition>
          <Transition {...getTransitionProps(props, 'panel')} {...panelTransitionHandlers}>
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
                  renderElement('icon', { name: 'x', slot: 'icon' }),
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
                        label: props.cancelText || intl('dialog.cancel').d('Cancel'),
                        asyncHandler: methods.close,
                      })}
                    {props.okBtn &&
                      renderElement('button', {
                        ...props.okBtnProps,
                        label: props.okText || intl('dialog.ok').d('OK'),
                        asyncHandler: methods.ok,
                      })}
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
