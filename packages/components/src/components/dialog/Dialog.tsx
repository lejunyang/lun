import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { DialogExpose, dialogEmits, dialogProps } from './type';
import { useBreakpoint, useCEExpose, useCEStates, useNamespace, useOpenModel } from 'hooks';
import { defineButton } from '../button';
import { defineSpin } from '../spin/Spin';
import { VCustomRenderer } from '../custom-renderer';
import { defineIcon } from '../icon/Icon';
import { refLikeToDescriptors, useDraggableMonitor, useFocusTrap, useNativeDialog, useSetupEdit } from '@lun/core';
import { Transition, onBeforeUnmount, ref, watch, watchEffect } from 'vue';
import { getTransitionProps, intl } from 'common';
import { WatermarkContext } from '../watermark';
import { methods } from './dialog.static-methods';
import { at, getDeepestActiveElement, roundByDPR, supportDialog, toPxIfNum, virtualGetMerge } from '@lun/utils';
import { useContextConfig } from 'config';
import { runIfFn } from '../../../../utils/src/function';

const name = 'dialog';
/** global current showing dialogs */
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
      const dialogRef = ref<HTMLDialogElement | HTMLDivElement>(),
        panelRef = ref<HTMLElement>(),
        maskRef = ref<HTMLElement>(),
        headerRef = ref<HTMLElement>();
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
            native: supportDialog,
            isOpen,
            open() {
              const { noMask, noTopLayer } = props;
              const dialog = dialogRef.value;
              if (dialog) {
                lastActiveElement = getDeepestActiveElement(); // save the last active element before dialog open, as after dialog opens, the active element will be the dialog itself
                supportDialog && (dialog as HTMLDialogElement)[noTopLayer ? 'show' : 'showModal']();
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
              if (props.disableWhenPending) editState.disabled = _pending;
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
          supportDialog && (dialogRef.value as HTMLDialogElement)?.close();
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

      useDraggableMonitor({
        el: dialogRef,
        disabled() {
          return !props.draggable && !props.headerDraggable;
        },
        asWhole: true,
        draggable(...args) {
          const { draggable, headerDraggable } = props;
          return headerDraggable ? headerRef.value!.contains(args[0]) : runIfFn(draggable, ...args);
        },
        onMove(_, { relativeX, relativeY }) {
          const el = panelRef.value!;
          el.style.transform = `translate(${roundByDPR(relativeX, el)}px, ${roundByDPR(relativeY, el)}px)`;
        },
        onClean() {
          if (panelRef.value) panelRef.value.style.transform = '';
        },
      });

      const [stateClass] = useCEStates(
        () => ({
          noTopLayer: props.noTopLayer || !supportDialog,
          confirm: props.isConfirm,
          noMask: props.noMask,
        }),
        ns,
        editComputed,
      );

      const Tag = supportDialog ? 'dialog' : 'div';
      return () => {
        const {
          noCloseBtn,
          closeBtnProps,
          noHeader,
          title,
          content,
          contentType,
          contentPreferHtml,
          noFooter,
          noCancelBtn,
          cancelBtnProps,
          cancelText,
          noOkBtn,
          okBtnProps,
          okText,
          headerDraggable,
        } = props;
        return (
          <Tag
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
                    {!noCloseBtn &&
                      renderElement(
                        'button',
                        {
                          class: ns.e('close'),
                          variant: 'ghost',
                          ...closeBtnProps,
                          asyncHandler: methods.close,
                          part: 'close',
                        },
                        renderElement('icon', { name: 'x', slot: 'icon' }),
                      )}
                    {!noHeader && (
                      <header
                        class={[ns.e('header'), ns.is('draggable', headerDraggable)]}
                        part="header"
                        ref={headerRef}
                      >
                        <slot name="header-start"></slot>
                        <slot name="header">{title}</slot>
                        <slot name="header-end"></slot>
                      </header>
                    )}
                    <div class={[ns.e('content')]} part="content">
                      <slot>
                        {content && (
                          <VCustomRenderer content={content} type={contentType} preferHtml={contentPreferHtml} />
                        )}
                      </slot>
                    </div>
                    {!noFooter && (
                      <footer class={[ns.e('footer')]} part="footer">
                        <slot name="footer-start"></slot>
                        <slot name="footer">
                          {!noCancelBtn &&
                            renderElement('button', {
                              variant: 'ghost',
                              ...cancelBtnProps,
                              label: cancelText || intl('dialog.cancel').d('Cancel'),
                              asyncHandler: methods.close,
                            })}
                          {!noOkBtn &&
                            renderElement('button', {
                              variant: 'solid',
                              ...okBtnProps,
                              label: okText || intl('dialog.ok').d('OK'),
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
          </Tag>
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
