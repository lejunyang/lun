import { defineSSRCustomElement } from 'custom';
import { watermarkProps } from './type';
import { createDefineElement, getElementFirstName, renderElement } from 'utils';
import { useNamespace, useShadowDom } from 'hooks';
import { VNode, computed, inject, onBeforeUnmount, onMounted, provide, reactive, ref, watchEffect } from 'vue';
import { useWatermark } from '@lun/core';
import { isTruthyOrZero } from '@lun/utils';

const name = 'watermark';
const ceStyle = `display: block !important; position: relative !important; inset: 0px !important; visibility: visible !important; opacity: 1 !important; transform: none !important; clip-path: none !important; animation: auto ease 0s 1 normal none running none !important; translate: none !important; scale: none !important;`;
const isTruthyOrZeroOrFalse = (v: any) => isTruthyOrZero(v) || v === false;

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
    const { getColor } = useNamespace(name);
    const { mutable } = props;
    const freezedProps = mutable ? props : reactive({ ...props });
    const shadow = useShadowDom();
    const markDiv = ref<HTMLDivElement>();
    let shadowRoot: ShadowRoot, lastStyle: string;

    if (!mutable) {
      const mayNeedUpdateKeys = new Set<keyof typeof watermarkProps>(
        (Object.keys(props) as any).filter((k: any) => !isTruthyOrZeroOrFalse(props[k])),
      );
      const stop = watchEffect(() => {
        for (const key of Array.from(mayNeedUpdateKeys)) {
          if (!isTruthyOrZeroOrFalse(freezedProps[key]) && isTruthyOrZeroOrFalse(props[key])) {
            // @ts-ignore
            freezedProps[key] = props[key];
            mayNeedUpdateKeys.delete(key);
          }
        }
        if (!mayNeedUpdateKeys.size) stop();
      });
    }

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

    const parent = WatermarkContext.inject();
    const watermark =
      freezedProps.reuse && parent.watermark
        ? parent.watermark
        : useWatermark(
            // @ts-ignore
            computed(() => ({ ...freezedProps, color: getColor(freezedProps) })),
          );
    const markStyle = computed(() => {
      const isImage = watermark.value[3];
      let {
        gapX = 100,
        gapY = 100,
        offsetLeft,
        offsetTop,
        zIndex,
      } = (isImage ? { ...freezedProps, ...freezedProps.imageProps } : freezedProps) as any;
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
      offsetLeft = offsetLeft === 'half-gap' || !isTruthyOrZero(offsetLeft) ? gapXCenter : offsetLeft;
      offsetTop = offsetTop === 'half-gap' || !isTruthyOrZeroOrFalse(offsetTop) ? gapYCenter : offsetTop;
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

    // provide render to show watermark in dialog, provide watermark to reuse
    WatermarkContext.provide({
      render: (nodes) =>
        freezedProps.noInherit ? nodes : renderElement(name, { ...freezedProps, reuse: true }, nodes),
      watermark,
    });
    return () => (
      <>
        <slot></slot>
        <div ref={markDiv}></div>
      </>
    );
  },
});

export const WatermarkContext = (() => {
  const key = Symbol(__DEV__ ? 'WatermarkContext' : '');
  type ProvideContent = {
    render: (nodes: VNode) => VNode | undefined;
    watermark?: ReturnType<typeof useWatermark>;
  };
  return {
    provide(content: ProvideContent) {
      provide(key, content);
    },
    inject() {
      return inject<ProvideContent>(key, {
        render: (i: any) => i,
      });
    },
  };
})();

export type tWatermark = typeof Watermark;
export type iWatermark = InstanceType<tWatermark>;

export const defineWatermark = createDefineElement(name, Watermark);
