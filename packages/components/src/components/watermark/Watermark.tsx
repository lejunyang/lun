import { defineSSRCustomElement } from 'custom';
import { watermarkProps } from './type';
import { createDefineElement, getElementFirstName } from 'utils';
import { useShadowDom } from 'hooks';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watchEffect } from 'vue';
import { useWatermark } from '@lun/core';

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
    const mayNeedUpdateKeys = new Set<keyof typeof watermarkProps>(
      (Object.keys(props) as any).filter((k: any) => !props[k]),
    );
    const freezedProps = reactive({ ...props });
    const shadow = useShadowDom();
    const markDiv = ref<HTMLDivElement>();
    let shadowRoot: ShadowRoot, lastStyle: string;

    const stop = watchEffect(() => {
      for (const key of Array.from(mayNeedUpdateKeys)) {
        if (!freezedProps[key] && props[key]) {
          freezedProps[key] = props[key] as any;
          mayNeedUpdateKeys.delete(key);
        }
      }
      if (!mayNeedUpdateKeys.size) stop();
    });

    // provide func (renderElement + freezedProps) to show watermark in dialog

    const ceObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        console.log('mutation', m, m.target, m.nextSibling, m.previousSibling);
        const removedSet = new Set(m.removedNodes);
        if (m.type === 'childList' && removedSet.has(shadow.CE!) && m.nextSibling) {
          CENext = m.nextSibling;
        }
      }
    });

    const shadowRootObserver = new MutationObserver((mutations) => {
      const div = markDiv.value!;
      for (const m of mutations) {
        console.log('shadowRootObserver m', m);
        if (m.type === 'childList' && m.removedNodes.length) {
          shadowRoot.append(...m.removedNodes);
          console.log('append', m.removedNodes);
        }
        if (m.type === 'attributes' && m.attributeName === 'style' && div.style.cssText !== lastStyle) {
          markDiv.value!.style.cssText = lastStyle;
          // DEV only, for debugging and preventing infinite loop
          if (__DEV__ && div.style.cssText !== lastStyle) {
            shadowRootObserver.disconnect();
            console.error('div.value.style.cssText !== markStyle.value');
            console.error('div.value.style.cssText', div.style.cssText);
            console.error('markStyle.value', markStyle.value);
          }
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
      shadowRoot = markDiv.value!.parentNode as ShadowRoot;
      ceObserver.observe(CEParent, { childList: true }); // if observe CE, the callback will be triggered very lately, after onBeforeUnmount
      console.log('markDiv.value!.parentNode!', markDiv.value!.parentNode!);
      shadowRootObserver.observe(shadowRoot, {
        childList: true,
        attributes: true,
        subtree: true,
      });
    });

    // onBeforeUnmount is ensured, it will be triggered after disconnectedCallback
    onBeforeUnmount(() => {
      ceObserver.disconnect();
      shadowRootObserver.disconnect();
      const CE = shadow.CE!;
      const newEl = document.createElement(getElementFirstName(name) as any) as HTMLElement;
      Object.assign(newEl, freezedProps);
      if (CE.childNodes.length) newEl.append(...CE.childNodes);
      if (CEParent?.isConnected) {
        CEParent.insertBefore(newEl, CENext);
      }
    });

    // @ts-ignore
    const watermark = useWatermark(freezedProps);
    const markStyle = computed(
      () =>
        `position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; pointer-events: none; background-repeat: repeat; background-image: url("${watermark.value[0]}"); visibility: visible !important;`,
    );
    watchEffect(() => {
      const { value } = markDiv;
      if (value) {
        value.style.cssText = markStyle.value;
        lastStyle = value.style.cssText;
      }
    });
    return () => (
      <>
        <slot></slot>
        <div ref={markDiv}></div>
      </>
    );
  },
});

export type tWatermark = typeof Watermark;
export type iWatermark = InstanceType<tWatermark>;

export const defineWatermark = createDefineElement(name, Watermark);
