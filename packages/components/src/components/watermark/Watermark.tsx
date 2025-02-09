import { defineCustomElement } from 'custom';
import { watermarkProps } from './type';
import { createDefineElement, getElementFirstName, renderElement } from 'utils';
import { useCE, useNamespace } from 'hooks';
import {
  CSSProperties,
  VNode,
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  watchEffect,
} from 'vue';
import { useWatermark } from '@lun-web/core';
import {
  createElement,
  deepCopy,
  isArray,
  isConnected,
  isObject,
  isTruthyOrZero,
  objectKeys,
  raf,
  setStyle,
} from '@lun-web/utils';
import { ElementWithExpose } from 'common';

const name = 'watermark';
const none = 'none',
  full = '100%';
const commonStyle = {
    width: full,
    height: full,
    display: 'block',
    visibility: 'visible',
    contentVisibility: 'visible',
  } satisfies CSSProperties,
  ceStyle = {
    ...commonStyle,
    position: 'relative',
    inset: '0px',
    opacity: 1,
    transform: none,
    clipPath: none,
    animation: none,
    translate: none,
    scale: none,
    maxHeight: full,
    maxWidth: full,
    filter: none,
    overflow: 'hidden', // in case of transforming children out of container to avoid watermark cover
  } satisfies CSSProperties;
let ceStyleString = '';
const isTruthyOrZeroOrFalse = (v: any) => isTruthyOrZero(v) || v === false;

const getCSSText = <E extends HTMLElement | undefined>(el: E) =>
  el?.style.cssText as E extends undefined ? string | undefined : string;

export const Watermark = defineCustomElement({
  name,
  props: watermarkProps,
  shadowOptions: {
    mode: 'closed',
  },
  onPropUpdate(key, value, ce) {
    if (key === 'style' && ceStyleString && value !== ceStyleString) {
      setStyle(ce, ceStyleString);
      return false;
    }
  },
  setup(props) {
    const { getColor } = useNamespace(name);
    const { mutable } = props;
    const freezedProps = mutable ? props : reactive(deepCopy(props));
    const CE = useCE();
    const markDiv = ref<HTMLDivElement>(),
      slotWrapper = ref<HTMLDivElement>(),
      slotEl = ref<HTMLSlotElement>();
    let shadowRoot: ShadowRoot, lastWatermarkStyle: string, lastSlotWrapperStyle: string;
    const allowedChildren = new WeakSet();

    if (!mutable) {
      const mayNeedUpdateKeys = new Set(objectKeys(props).filter((k) => !isTruthyOrZeroOrFalse(props[k])));
      if (mayNeedUpdateKeys.size) {
        const stop = watchEffect(() => {
          for (const key of mayNeedUpdateKeys) {
            const val: any = props[key];
            if (!isTruthyOrZeroOrFalse(freezedProps[key]) && isTruthyOrZeroOrFalse(val)) {
              // array: content; object: color; need to shallow copy them in case of mutation
              freezedProps[key] = isArray(val) ? [...val] : isObject(val) ? { ...val } : val;
              mayNeedUpdateKeys.delete(key);
            }
          }
          if (!mayNeedUpdateKeys.size) stop();
        });
      }
    }

    const ceObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        const removedSet = new Set(m.removedNodes);
        if (m.type === 'childList' && removedSet.has(CE) && m.nextSibling) {
          CENext = m.nextSibling;
        }
      }
    });

    const shadowRootObserver = new MutationObserver((mutations) => {
      const div = markDiv.value!,
        wrapper = slotWrapper.value!,
        slot = slotEl.value!;
      for (const m of mutations) {
        if (m.type === 'childList') {
          // disable adding other nodes into shadowRoot
          m.addedNodes.forEach((n) => {
            if (!allowedChildren.has(n)) n.parentNode?.removeChild(n);
          });
          if ([...m.removedNodes].find((n) => allowedChildren.has(n))) {
            shadowRootObserver.disconnect();
            slot.remove();
            wrapper.append(slot);
            shadowRoot.append(wrapper, div);
            observeRoot();
          }
        }
        if (m.type === 'attributes' && m.attributeName === 'style') {
          if (getCSSText(div) !== lastWatermarkStyle) setStyle(div, lastWatermarkStyle);
          if (getCSSText(wrapper) !== lastSlotWrapperStyle) setStyle(wrapper, lastSlotWrapperStyle);
        }
      }
    });

    // In either MutationObserver callback or disconnectedCallback, CE.isConnected is false, we can't get CE.parentElement, need to store it in mount
    let CEParent: HTMLElement,
      CENext: Node | null = null;
    const observeRoot = () =>
      shadowRootObserver.observe(shadowRoot, {
        childList: true,
        attributes: true,
        subtree: true,
      });
    if (ceStyleString) setStyle(CE, ceStyleString);
    else {
      setStyle(CE, ceStyle, true);
      ceStyleString = getCSSText(CE);
    }
    onMounted(() => {
      allowedChildren.add(slotWrapper.value!);
      allowedChildren.add(slotWrapper.value!.firstElementChild!);
      allowedChildren.add(markDiv.value!);
      CEParent = CE.parentElement!;
      shadowRoot = markDiv.value!.parentNode as ShadowRoot;
      ceObserver.observe(CEParent, { childList: true }); // if observe CE, the callback will be triggered very lately, after onBeforeUnmount
      observeRoot();
    });

    // onBeforeUnmount is ensured, it will be triggered after disconnectedCallback
    onBeforeUnmount(() => {
      ceObserver.disconnect();
      shadowRootObserver.disconnect();
      const children = CE.childNodes;
      raf(() => {
        // TODO remove old CE if it's still connected
        if (isConnected(CEParent)) {
          const newEl = createElement(getElementFirstName(name) as any, freezedProps) as HTMLElement;
          if (children.length) newEl.append(...children);
          CEParent.insertBefore(newEl, CENext);
        }
      });
    });

    const parent = WatermarkContext.inject();
    const initial = 'rgba(0,0,0,.15)';
    const watermark =
      freezedProps.reuse && parent.watermark
        ? parent.watermark
        : useWatermark(
            // @ts-ignore
            computed(() => ({
              ...freezedProps,
              color: getColor(freezedProps, 'color', {
                initial,
                light: initial,
                dark: 'rgba(255,255,255,.18)',
              }),
            })),
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
        ...commonStyle, // need display block in case add 'hidden' attr in dev tool
        position: 'absolute',
        top: '0px',
        left: '0px',
        pointerEvents: none,
        backgroundRepeat: 'repeat',
        backgroundImage: `url("${watermark.value[0]}")`,
        backgroundPosition: '',
        backgroundSize: `${Math.floor(watermark.value[1])}px`,
        zIndex,
      } satisfies CSSProperties;
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
        lastWatermarkStyle = getCSSText(value);
      }
      lastSlotWrapperStyle = getCSSText(slotWrapper.value) || '';
    });

    // provide render to show watermark in dialog, provide watermark to reuse
    WatermarkContext.provide({
      render: (nodes) =>
        freezedProps.noInherit ? nodes : renderElement(name, { ...freezedProps, reuse: true, id: name }, nodes),
      watermark,
    });
    const slotStyle = {
      position: 'relative' as const,
      zIndex: 0,
    };
    // slot needs to be wrapped with a low z-index div to make it below the watermark
    return () => (
      <>
        <div style={slotStyle} ref={slotWrapper}>
          <slot ref={slotEl}></slot>
        </div>
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

export type WatermarkExpose = {};
export type tWatermark = ElementWithExpose<typeof Watermark, WatermarkExpose>;
export type iWatermark = InstanceType<tWatermark>;

export const defineWatermark = createDefineElement(name, Watermark);
