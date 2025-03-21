import { defineCustomElement } from 'custom';
import { createDefineElement, renderElement, toElement } from 'utils';
import { dialogEmits, dialogProps } from './type';
import { useBreakpoint, useCEExpose, useCEStates, useNamespace, useOpenModel, useSlot } from 'hooks';
import { defineButton } from '../button';
import { defineSpin } from '../spin/Spin';
import { defineIcon } from '../icon/Icon';
import {
  refLikeToDescriptors,
  useDraggableArea,
  useFocusTrap,
  useTempInlineStyle,
  useNativeDialog,
  useSetupEdit,
  useSetupEvent,
  useRefWeakMap,
} from '@lun-web/core';
import { Transition, TransitionProps, onBeforeUnmount, ref, watch, watchEffect } from 'vue';
import { ElementWithExpose, getCompParts, getTransitionProps, intl } from 'common';
import { WatermarkContext } from '../watermark';
import { methods } from './dialog.static-methods';
import {
  runIfFn,
  at,
  getDeepestActiveElement,
  roundByDPR,
  supportDialog,
  toPxIfNum,
  getDocumentElement,
  withResolvers,
  getRect,
  extend,
} from '@lun-web/utils';
import { useContextConfig } from 'config';
import { getContainingBlock, isLastTraversableNode } from '@floating-ui/utils/dom';

const name = 'dialog';
const parts = ['root', 'mask', 'panel', 'header', 'close', 'content', 'footer'] as const;
const compParts = getCompParts(name, parts);
/** a map to store all showing dialogs with mask in each container, to make sure only one mask is shown in each container at the same time. */
const [getContainerShowing, setContainerShowing] = useRefWeakMap<HTMLElement | Window, HTMLElement[]>();
export const Dialog = Object.assign(
  defineCustomElement({
    name,
    props: dialogProps,
    emits: dialogEmits,
    setup(props, { emit: e }) {
      const ns = useNamespace(name);
      const emit = useSetupEvent<typeof e>();
      const openModel = useOpenModel(props);
      const maskShow = ref(false),
        isOpen = ref(false);
      const dialogRef = ref<HTMLDialogElement | HTMLDivElement>(),
        panelRef = ref<HTMLElement>(),
        maskRef = ref<HTMLElement>(),
        headerRef = ref<HTMLElement>();
      const zIndex = useContextConfig('zIndex');
      const width = useBreakpoint(props, 'width', toPxIfNum);
      const [_editComputed, editState] = useSetupEdit({
        noInherit: true,
      });
      const pending = ref(false);

      const [initFocus, restoreFocus] = useFocusTrap();
      let lastActiveElement: HTMLElement | undefined,
        lastContainer = ref<HTMLElement>(),
        dialogLeaveResolver: (() => void) | undefined,
        isUnmounting: boolean;
      const { dialogHandlers, methods, maskHandlers } = useNativeDialog(
        extend(props, {
          native: supportDialog,
          isOpen,
          open() {
            const { noMask, noTopLayer } = props;
            const dialog = dialogRef.value;
            if (dialog) {
              lastActiveElement = getDeepestActiveElement(); // save the last active element before dialog open, as after dialog opens, the active element will be the dialog itself
              supportDialog && (dialog as HTMLDialogElement)[noTopLayer ? 'show' : 'showModal']();
              openModel.value = isOpen.value = true;
              if ((maskShow.value = !noMask)) {
                const con = lastContainer.value;
                if (con) {
                  const showing = getContainerShowing(con) || [];
                  showing.push(dialog);
                  setContainerShowing(con, showing);
                }
              }
            }
          },
          close() {
            const dialog = dialogRef.value,
              container = lastContainer.value;
            if (dialog) {
              openModel.value = isOpen.value = maskShow.value = false;
              if (container) {
                const showing = (getContainerShowing(container) || []).filter((el) => el !== dialog);
                setContainerShowing(container, showing);
                lastContainer.value = undefined;
              }
              if (isUnmounting) return;
              const [promise, resolve] = withResolvers();
              dialogLeaveResolver = resolve;
              return promise;
            }
          },
          isPending: pending,
          onPending(_pending: boolean) {
            pending.value = _pending;
            if (props.disableWhenPending) editState.disabled = _pending;
          },
          lockScroll: () => {
            const { noTopLayer, noMask, noLockScroll } = props;
            // if topLayer, we need to lock scroll anyway, as you can't interact with behind elements even when no mask
            return !(noTopLayer && noMask) && !noLockScroll;
          },
          container() {
            const { noMask, noTopLayer, container } = props;
            const dialog = dialogRef.value;
            if (!noMask && dialog) {
              const dialogDocEl = getDocumentElement(dialog);
              let con: HTMLElement | Window;
              if (supportDialog && !noTopLayer) con = dialogDocEl;
              else {
                con = (toElement(container) as HTMLElement) || getContainingBlock(dialog);
                // last traversable node: body, html, #document, consider them as window
                if (!con || isLastTraversableNode(con)) con = getDocumentElement(dialog);
              }
              return (lastContainer.value = con);
            }
          },
        }),
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
        if (!el || !mask) return;
        if (at(getContainerShowing(lastContainer.value!), -1) === el) mask.style.display = '';
        else mask.style.display = 'none';
      });

      const panelTransitionHandlers: TransitionProps = {
        onAfterEnter(el) {
          const { alwaysTrapFocus, noTopLayer } = props;
          // why panel.value can be undefine here if no css transition, use el of param instead
          const focus = initFocus(el as HTMLElement, !alwaysTrapFocus && !noTopLayer, lastActiveElement);
          focus();
          emit('afterOpen');
        },
        onAfterLeave() {
          supportDialog && (dialogRef.value as HTMLDialogElement)?.close();
          restoreFocus();
          if (dialogLeaveResolver) dialogLeaveResolver();
          emit('afterClose');
        },
      };

      // emit close event doesn't work in onBeforeUnmount
      onBeforeUnmount(() => {
        isUnmounting = true;
        methods.close();
      });

      useCEExpose(
        {
          openDialog: methods.open,
          closeDialog: methods.close,
          toggleDialog: methods.toggle,
        },
        refLikeToDescriptors({ isOpen, panelElement: panelRef }),
      );

      // if there is a parent watermark, wrap children with watermark render
      const { render } = WatermarkContext.inject();

      const [setStyle, restoreStyle] = useTempInlineStyle();
      useDraggableArea({
        el: dialogRef,
        disabled() {
          return !props.customDraggable && !props.headerDraggable;
        },
        asWhole: true,
        ignoreWhenAlt: true,
        limitInContainer: 'bound',
        getTargetRect() {
          return getRect(panelRef.value!);
        },
        draggable(...args) {
          const { customDraggable, headerDraggable } = props;
          return headerDraggable ? headerRef.value!.contains(args[0]) : runIfFn(customDraggable, ...args);
        },
        onMove(_, { relativeX, relativeY, left, top }) {
          const el = panelRef.value!;
          const process = (val: number) => toPxIfNum(roundByDPR(val, el));
          if (props.noTransform) setStyle(el, { left: process(left), top: process(top) });
          else
            setStyle(el, {
              transform: `translate3d(${process(relativeX)}, ${process(relativeY)}, 0)`,
            });
          // FIXME maybe won't fix. after dragging，if we change the size of viewport, the position look weird as relative position size may be too large for new viewport
        },
        onClean() {
          restoreStyle(panelRef.value);
        },
      });

      const [stateClass] = useCEStates(() => ({
        noTopLayer: props.noTopLayer || !supportDialog,
        confirm: props.isConfirm,
        noMask: props.noMask,
      }));

      const [renderHeader] = useSlot('header', () => props.header);
      const [renderContent] = useSlot(undefined, () => props.content);

      const Tag = supportDialog ? 'dialog' : 'div';
      return () => {
        const {
          noCloseBtn,
          closeBtnProps,
          noHeader,
          noFooter,
          noCancelBtn,
          cancelBtnProps,
          cancelText,
          noOkBtn,
          okBtnProps,
          okText,
          headerDraggable,
          panelStyle,
          maskStyle,
        } = props;
        return (
          <Tag
            class={stateClass.value}
            part={compParts[0]}
            ref={dialogRef}
            {...dialogHandlers}
            style={{ zIndex: zIndex.dialog }}
          >
            <Transition {...getTransitionProps(props, 'mask', 'bgFade')}>
              <div
                // do not use v-content, mask element has its own size; also in watchEffect it's using display now
                v-show={maskShow.value}
                class={ns.e('mask')}
                part={compParts[1]}
                ref={maskRef}
                tabindex={-1}
                style={maskStyle}
                {...maskHandlers}
              />
            </Transition>
            <Transition {...getTransitionProps(props, 'panel', 'scale')} {...panelTransitionHandlers}>
              <div
                // if use v-content, transition is not working... no idea, use v-show for now
                v-show={isOpen.value}
                class={ns.e('panel')}
                ref={panelRef}
                part={compParts[2]}
                style={{ width: width.value, ...panelStyle }}
              >
                {render(
                  <>
                    {!noCloseBtn &&
                      renderElement(
                        'button',
                        {
                          class: ns.e('close'),
                          variant: 'ghost',
                          ...closeBtnProps,
                          asyncHandler: methods.close,
                          part: compParts[4],
                        },
                        renderElement('icon', { name: 'x', slot: 'icon' }),
                      )}
                    {!noHeader && (
                      <header
                        class={[ns.e('header'), ns.is('draggable', headerDraggable)]}
                        part={compParts[3]}
                        ref={headerRef}
                      >
                        {renderHeader()}
                      </header>
                    )}
                    <div class={[ns.e('content')]} part={compParts[5]}>
                      {renderContent()}
                    </div>
                    {!noFooter && (
                      <footer class={[ns.e('footer')]} part={compParts[6]}>
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
                  </>,
                )}
              </div>
            </Transition>
          </Tag>
        );
      };
    },
  }),
  methods,
);

export type DialogExpose = {
  openDialog: () => void;
  closeDialog: () => Promise<void>;
  toggleDialog: () => Promise<void> | undefined;
  readonly isOpen: boolean;
  readonly panelElement: HTMLDivElement | undefined;
};
export type tDialog = ElementWithExpose<typeof Dialog, DialogExpose>;
export type iDialog = InstanceType<tDialog>;

export const defineDialog = createDefineElement(
  name,
  Dialog,
  {
    escapeClosable: true,
    width: '450px',
  },
  parts,
  [defineSpin, defineIcon, defineButton],
);
