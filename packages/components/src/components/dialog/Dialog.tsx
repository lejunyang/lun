import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { dialogProps } from './type';
import { ref } from 'vue';
import { useNamespace } from 'hooks';
import { defineButton } from '../button';
import { defineSpin } from '../spin/Spin';
import { defineCustomRenderer } from '../custom-renderer';

const name = 'dialog';
export const Dialog = defineSSRCustomElement({
  name,
  props: dialogProps,
  setup(props) {
    const ns = useNamespace(name);
    const dialogRef = ref<HTMLDialogElement>();
    return () => {
      return (
        <dialog class={[ns.b()]} part="dialog" ref={dialogRef}>
          {props.header && (
            <header class={[ns.e('header')]} part="header">
              <slot name="header-start"></slot>
              <slot name="header">{props.title}</slot>
              <slot name="header-end">
                <button class={[ns.e('close')]} part="close" onClick={() => dialogRef.value?.close()}>
                  <slot name="close-icon">x</slot>
                </button>
              </slot>
            </header>
          )}
          <main class={[ns.e('content')]} part="main">
            <slot>{props.content && renderElement('custom-renderer', { content: props.content })}</slot>
          </main>
          {props.footer && (
            <footer class={[ns.e('footer')]} part="footer">
              <slot name="footer-start"></slot>
              <slot name="footer">
                {props.cancelBtn &&
                  renderElement('button', {
                    ...props.cancelBtnProps,
                    label: props.cancelText,
                    // onClick: () => dialogRef.value?.close(),
                  })}
                {props.okBtn && renderElement('button', { ...props.okBtnProps, label: props.okText })}
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
  button: defineButton,
  'custom-renderer': defineCustomRenderer,
});
