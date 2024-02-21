import { defineSSRCustomElement } from 'custom';
import { watermarkProps } from './type';
import { createDefineElement, getElementFirstName } from 'utils';
import { useShadowDom } from 'hooks';
import { onBeforeUnmount, onMounted, reactive } from 'vue';

const name = 'watermark';
const ceStyle =
  'display: block !important; position: relative !important; visibility: visible !important; opacity: 1 !important; transform: none !important; clip-path: none !important;';
export const Watermark = defineSSRCustomElement({
  name,
  props: watermarkProps,
  shadowOptions: {
    mode: 'closed',
  },
  onPropUpdate(key, value, ce) {
    if (key === 'style' && value !== ceStyle) {
      ce.style.cssText = ceStyle;
      return false;
    }
  },
  setup(props) {
    const freezedProps = reactive({ ...props });
    const shadow = useShadowDom();

    // provide func (renderElement + freezedProps) to show watermark in dialog

    const ob = new MutationObserver((mutations) => {
      for (const m of mutations) {
        console.log('mutation', m, m.target, m.nextSibling, m.previousSibling);
        const removedSet = new Set(m.removedNodes);
        if (m.type === 'childList' && removedSet.has(shadow.CE!) && m.nextSibling) {
          CENext = m.nextSibling;
        }
      }
    });

    // In either MutationObserver callback or disconnectedCallback, CE.isConnected is false, we can't get CE.parentElement, need to store it in mount
    let CEParent: HTMLElement,
      CENext: Node | null = null;
    onMounted(() => {
      const CE = shadow.CE!;
      CE.style.cssText = ceStyle;
      CEParent = CE.parentElement!;
      ob.observe(CEParent, { childList: true }); // if observe CE, the callback will be triggered very lately, after onBeforeUnmount
    });

    // onBeforeUnmount is ensured, it will be triggered after disconnectedCallback
    onBeforeUnmount(() => {
      ob.disconnect();
      const CE = shadow.CE!;
      const newEl = document.createElement(getElementFirstName(name) as any) as HTMLElement;
      Object.assign(newEl, freezedProps);
      if (CE.childNodes.length) newEl.append(...CE.childNodes);
      if (CEParent?.isConnected) {
        CEParent.insertBefore(newEl, CENext);
      }
    });
    return () => (
      <>
        <slot></slot>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          test
        </div>
      </>
    );
  },
});

export type tWatermark = typeof Watermark;
export type iWatermark = InstanceType<tWatermark>;

export const defineWatermark = createDefineElement(name, Watermark);
