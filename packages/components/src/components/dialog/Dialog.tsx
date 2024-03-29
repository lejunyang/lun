import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { DialogExpose, dialogEmits, dialogProps } from './type';
import { useCEExpose, useCEStates, useNamespace, useOpenModel } from 'hooks';
import { defineButton } from '../button';
import { defineSpin } from '../spin/Spin';
import { VCustomRenderer } from '../custom-renderer';
import { defineIcon } from '../icon/Icon';
import { useNativeDialog, useSetupEdit } from '@lun/core';
import { Transition, computed, ref, watch } from 'vue';
import { getTransitionProps, intl } from 'common';
import { WatermarkContext } from '../watermark';
import { methods } from './dialog.static-methods';
import { toPxIfNum } from '@lun/utils';

const name = 'dialog';
export const Dialog = Object.assign(
  defineSSRCustomElement({
    name,
    props: dialogProps,
    emits: dialogEmits,
    setup(props, { emit }) {
      const ns = useNamespace(name);
      const openModel = useOpenModel(props, { passive: true });
      const maskShow = ref(false);
      const dialogRef = ref<HTMLDialogElement>();
      const [editComputed, editState] = useSetupEdit({
        noInherit: true,
      });
      const pending = ref(false);
      const { dialogHandlers, methods, maskHandlers } = useNativeDialog(
        computed(() => {
          const { disabledAllWhenPending, noMask, noTopLayer } = props;
          return {
            ...props,
            native: true,
            isOpen: openModel,
            open() {
              if (dialogRef.value) {
                dialogRef.value[noTopLayer ? 'show' : 'showModal']();
                openModel.value = true;
                maskShow.value = !noMask;
              }
            },
            close() {
              if (dialogRef.value) {
                openModel.value = maskShow.value = false;
              }
            },
            isPending: pending,
            onPending(_pending) {
              pending.value = _pending;
              if (disabledAllWhenPending) editState.disabled = _pending;
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

      // if there is a parent watermark, wrap children with watermark render
      const { render } = WatermarkContext.inject();

      const [stateClass] = useCEStates(
        () => ({ 'no-top-layer': props.noTopLayer, confirm: props.isConfirm }),
        ns,
        editComputed,
      );
      return () => {
        return (
          <dialog
            class={stateClass.value}
            part="root"
            ref={dialogRef}
            {...dialogHandlers}
            style={{ width: toPxIfNum(props.width) }}
            // title is a global HTMLAttributes, but we use it as prop. it will make the dialog show tooltip even if inheritAttrs is false, we need to set an empty title to prevent it
            title=""
          >
            {render(
              <>
                <Transition {...getTransitionProps(props, 'mask')}>
                  <div v-show={maskShow.value} class={ns.e('mask')} part="mask" tabindex={-1} {...maskHandlers}></div>
                </Transition>
                <Transition {...getTransitionProps(props, 'panel')} {...panelTransitionHandlers}>
                  <div v-show={openModel.value} class={ns.e('panel')} part="panel">
                    {!props.noCloseBtn &&
                      renderElement(
                        'button',
                        {
                          class: ns.e('close'),
                          variant: 'ghost',
                          ...props.closeBtnProps,
                          asyncHandler: methods.close,
                          part: 'close',
                        },
                        renderElement('icon', { name: 'x', slot: 'icon' }),
                      )}
                    {!props.noHeader && (
                      <header class={[ns.e('header')]} part="header">
                        <slot name="header-start"></slot>
                        <slot name="header">{props.title}</slot>
                        <slot name="header-end"></slot>
                      </header>
                    )}
                    <div class={[ns.e('content')]} part="content">
                      <slot>
                        {props.content && (
                          <VCustomRenderer
                            content={props.content}
                            type={props.contentType}
                            preferHtml={props.contentPreferHtml}
                          />
                        )}
                      </slot>
                    </div>
                    {!props.noFooter && (
                      <footer class={[ns.e('footer')]} part="footer">
                        <slot name="footer-start"></slot>
                        <slot name="footer">
                          {!props.noCancelBtn &&
                            renderElement('button', {
                              ...props.cancelBtnProps,
                              label: props.cancelText || intl('dialog.cancel').d('Cancel'),
                              asyncHandler: methods.close,
                            })}
                          {!props.noOkBtn &&
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
              </>,
            )}
          </dialog>
        );
      };
    },
  }),
  methods,
);

export type tDialog = typeof Dialog;
export type iDialog = InstanceType<tDialog> & DialogExpose;

export const defineDialog = createDefineElement(name, Dialog, {
  spin: defineSpin,
  icon: defineIcon,
  button: defineButton,
});
