import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { DialogExpose, dialogEmits, dialogProps } from './type';
import { useBreakpoint, useCEExpose, useCEStates, useNamespace, useOpenModel } from 'hooks';
import { defineButton } from '../button';
import { defineSpin } from '../spin/Spin';
import { VCustomRenderer } from '../custom-renderer';
import { defineIcon } from '../icon/Icon';
import { refLikeToDescriptors, useFocusTrap, useNativeDialog, useSetupEdit } from '@lun/core';
import { Transition, onBeforeUnmount, ref, watch, watchEffect } from 'vue';
import { getTransitionProps, intl } from 'common';
import { WatermarkContext } from '../watermark';
import { methods } from './dialog.static-methods';
import { at, getDeepestActiveElement, toPxIfNum, virtualGetMerge } from '@lun/utils';
import { useContextConfig } from 'config';

const name = 'dialog';
const showing = ref<HTMLElement[]>([]);
export const Dialog = Object.assign(
  defineSSRCustomElement({
    name,
    props: dialogProps,
    emits: dialogEmits,
    setup(props, { emit }) {
      const ns = useNamespace(name);
      const openModel = useOpenModel(props);
      const maskShow = ref(false),
        isOpen = ref(false);
      const dialogRef = ref<HTMLDialogElement>(),
        panelRef = ref<HTMLElement>(),
        maskRef = ref<HTMLElement>();
      const zIndex = useContextConfig('zIndex');
      const width = useBreakpoint(props, 'width', toPxIfNum);
      const [editComputed, editState] = useSetupEdit({
        noInherit: true,
      });
      const pending = ref(false);

      const [initFocus, restoreFocus] = useFocusTrap();
      let lastActiveElement: HTMLElement | undefined;
      const { dialogHandlers, methods, maskHandlers } = useNativeDialog(
        virtualGetMerge(
          {
            native: true,
            isOpen,
            open() {
              const { noMask, noTopLayer } = props;
              const dialog = dialogRef.value;
              if (dialog) {
                lastActiveElement = getDeepestActiveElement(); // save the last active element before dialog open, as after dialog opens, the active element will be the dialog itself
                dialog[noTopLayer ? 'show' : 'showModal']();
                openModel.value = isOpen.value = true;
                if ((maskShow.value = !noMask)) showing.value.push(dialog);
              }
            },
            close() {
              if (dialogRef.value) {
                openModel.value = isOpen.value = maskShow.value = false;
                showing.value = showing.value.filter((el) => el !== dialogRef.value);
              }
            },
            isPending: pending,
            onPending(_pending: boolean) {
              pending.value = _pending;
              if (props.disabledAllWhenPending) editState.disabled = _pending;
            },
            lockScroll: () => {
              const { noTopLayer, noMask } = props;
              return !noTopLayer || !noMask;
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

      watchEffect(() => {
        const el = dialogRef.value,
          mask = maskRef.value!;
        if (!el) return;
        if (at(showing.value, -1) === el) mask.style.display = '';
        else mask.style.display = 'none';
      });

      const panelTransitionHandlers = {
        onAfterEnter() {
          const { alwaysTrapFocus, noTopLayer } = props;
          const focus = initFocus(panelRef.value!, !alwaysTrapFocus && !noTopLayer, lastActiveElement);
          focus();
          emit('afterOpen');
        },
        onAfterLeave() {
          dialogRef.value?.close();
          restoreFocus();
          emit('afterClose');
        },
      };

      // emit close event doesn't work in onBeforeUnmount
      onBeforeUnmount(methods.close);

      useCEExpose(
        {
          openDialog: methods.open,
          closeDialog: methods.close,
          toggleDialog: methods.toggle,
        },
        refLikeToDescriptors({ isOpen }),
      );

      // if there is a parent watermark, wrap children with watermark render
      const { render } = WatermarkContext.inject();

      const [stateClass] = useCEStates(
        () => ({ 'no-top-layer': props.noTopLayer, confirm: props.isConfirm, 'no-mask': props.noMask }),
        ns,
        editComputed,
      );

      return () => {
        // TODO render div for those who don't support dialog
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
                  <div
                    v-show={maskShow.value}
                    class={ns.e('mask')}
                    part="mask"
                    ref={maskRef}
                    tabindex={-1}
                    {...maskHandlers}
                  />
                </Transition>
                <Transition {...getTransitionProps(props, 'panel')} {...panelTransitionHandlers}>
                  <div
                    v-show={isOpen.value}
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
