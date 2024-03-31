import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { DialogExpose, dialogEmits, dialogProps } from './type';
import { useBreakpoint, useCEExpose, useCEStates, useNamespace, useOpenModel } from 'hooks';
import { defineButton } from '../button';
import { defineSpin } from '../spin/Spin';
import { VCustomRenderer } from '../custom-renderer';
import { defineIcon } from '../icon/Icon';
import { useFocusTrap, useNativeDialog, useSetupEdit } from '@lun/core';
import { Transition, ref, watch } from 'vue';
import { getTransitionProps, intl } from 'common';
import { WatermarkContext } from '../watermark';
import { methods } from './dialog.static-methods';
import { getDeepestActiveElement, raf, toNumberIfValid, toPxIfNum, virtualGetMerge } from '@lun/utils';
import { useContextConfig } from 'config';

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
      const dialogRef = ref<HTMLDialogElement>(),
        panelRef = ref<HTMLElement>();
      const zIndex = useContextConfig('zIndex');
      const width = useBreakpoint(props, 'width', (val) => toPxIfNum(toNumberIfValid(val)));
      const [editComputed, editState] = useSetupEdit({
        noInherit: true,
      });
      const pending = ref(false);

      const [initTrap, restoreFocus] = useFocusTrap();
      let lastActiveElement: HTMLElement | undefined;;
      const { dialogHandlers, methods, maskHandlers } = useNativeDialog(
        virtualGetMerge(
          {
            native: true,
            isOpen: openModel,
            open() {
              const { noMask, noTopLayer } = props;
              if (dialogRef.value) {
                lastActiveElement = getDeepestActiveElement(); // save the last active element before dialog open, as after dialog opens, the active element will be the dialog itself
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
            onPending(_pending: boolean) {
              pending.value = _pending;
              if (props.disabledAllWhenPending) editState.disabled = _pending;
            },
          },
          props,
        ),
      );

      watch([openModel, dialogRef], ([open, dialog]) => {
        if (dialog) {
          if (open) methods.open();
          else methods.close();
        }
      });

      const panelTransitionHandlers = {
        onAfterEnter() {
          const focus = initTrap(panelRef.value!, !props.noTopLayer, lastActiveElement);
          focus();
          emit('afterOpen');
        },
        onAfterLeave() {
          dialogRef.value?.close();
          restoreFocus();
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
        () => ({ 'no-top-layer': props.noTopLayer, confirm: props.isConfirm, 'no-mask': props.noMask }),
        ns,
        editComputed,
      );
      // TODO prevent background scrolling
      return () => {
        return (
          <dialog
            class={stateClass.value}
            part="root"
            ref={dialogRef}
            {...dialogHandlers}
            // title is a global HTMLAttributes, but we use it as prop. it will make the dialog show tooltip even if inheritAttrs is false, we need to set an empty title to prevent it
            title=""
            style={{ zIndex: zIndex.dialog }}
          >
            {render(
              <>
                <Transition {...getTransitionProps(props, 'mask')}>
                  <div v-show={maskShow.value} class={ns.e('mask')} part="mask" tabindex={-1} {...maskHandlers}></div>
                </Transition>
                <Transition {...getTransitionProps(props, 'panel')} {...panelTransitionHandlers}>
                  <div
                    v-show={openModel.value}
                    class={ns.e('panel')}
                    ref={panelRef}
                    part="panel"
                    style={{ width: width.value }}
                  >
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
                              variant: 'ghost',
                              ...props.cancelBtnProps,
                              label: props.cancelText || intl('dialog.cancel').d('Cancel'),
                              asyncHandler: methods.close,
                            })}
                          {!props.noOkBtn &&
                            renderElement('button', {
                              variant: 'ghost',
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
