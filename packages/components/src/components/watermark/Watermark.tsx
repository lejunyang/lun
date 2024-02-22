import { defineSSRCustomElement } from 'custom';
import { watermarkProps } from './type';
import { createDefineElement, getElementFirstName } from 'utils';
import { useShadowDom } from 'hooks';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watchEffect } from 'vue';
import { useWatermark } from '@lun/core';
import { isTruthyOrZero } from '@lun/utils';

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
      (Object.keys(props) as any).filter((k: any) => !isTruthyOrZero(props[k])),
    );
    const freezedProps = reactive({ ...props });
    const shadow = useShadowDom();
    const markDiv = ref<HTMLDivElement>();
    let shadowRoot: ShadowRoot, lastStyle: string;

    const stop = watchEffect(() => {
      for (const key of Array.from(mayNeedUpdateKeys)) {
        if (!isTruthyOrZero(freezedProps[key]) && isTruthyOrZero(props[key])) {
          freezedProps[key] = props[key] as any;
          mayNeedUpdateKeys.delete(key);
        }
      }
      if (!mayNeedUpdateKeys.size) stop();
    });

    // provide func (renderElement + freezedProps) to show watermark in dialog

    const ceObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        const removedSet = new Set(m.removedNodes);
        if (m.type === 'childList' && removedSet.has(shadow.CE!) && m.nextSibling) {
          CENext = m.nextSibling;
        }
      }
    });

    const shadowRootObserver = new MutationObserver((mutations) => {
      const div = markDiv.value!;
      for (const m of mutations) {
        if (m.type === 'childList' && m.removedNodes.length) {
          shadowRoot.append(...m.removedNodes);
        }
        if (m.type === 'attributes' && m.attributeName === 'style' && div.style.cssText !== lastStyle) {
          div.style.cssText = lastStyle;
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
    const markStyle = computed(() => {
      const { gapX = 100, gapY = 100, offsetX, offsetY, zIndex } = freezedProps as any;
      const style = {
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        backgroundRepeat: 'repeat',
        backgroundImage: `url("${watermark.value[0]}")`,
        visibility: 'visible',
        backgroundPosition: '',
        backgroundSize: `${Math.floor(watermark.value[1])}px`,
        zIndex,
      };
      const gapXCenter = gapX / 2,
        gapYCenter = gapY / 2;
      const offsetLeft = offsetX ?? gapXCenter,
        offsetTop = offsetY ?? gapYCenter;
      let positionLeft = offsetLeft - gapXCenter;
      let positionTop = offsetTop - gapYCenter;
      if (positionLeft > 0) {
        style.left = `${positionLeft}px`;
        style.width = `calc(100% - ${positionLeft}px)`;
        positionLeft = 0;
      }
      if (positionTop > 0) {
        style.top = `${positionTop}px`;
        style.height = `calc(100% - ${positionTop}px)`;
        positionTop = 0;
      }
      style.backgroundPosition = `${positionLeft}px ${positionTop}px`;
      return style;
    });
    watchEffect(() => {
      const { value } = markDiv;
      if (value) {
        Object.assign(value.style, markStyle.value);
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
