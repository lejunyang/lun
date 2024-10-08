import type { ObjectDirective } from '@vue/runtime-core';
import { supportCSSContentVisibility, isHTMLSlotElement } from '@lun/utils';

export const vContentVisibilityOriginal = Symbol(__DEV__ ? '_vcvo' : '');
export const vContentSlotDisplayOriginal = Symbol(__DEV__ ? '_vcvdo' : '');

export interface VShowElement extends HTMLElement {
  // _vocv = vue original content visibility
  [vContentVisibilityOriginal]: string;
  [vContentSlotDisplayOriginal]: string;
}

const targetValue = supportCSSContentVisibility ? 'hidden' : 'none',
  targetProp = supportCSSContentVisibility ? 'contentVisibility' : 'display';

export const vContent: ObjectDirective<VShowElement> & { name?: 'content' } = {
  beforeMount(el, { value }, { transition }) {
    el[vContentVisibilityOriginal] = el.style[targetProp] === targetValue ? '' : el.style[targetProp];
    if (isHTMLSlotElement(el)) el[vContentSlotDisplayOriginal] = el.style.display;
    if (transition && value) {
      transition.beforeEnter(el);
    } else {
      setDisplay(el, value);
    }
  },
  mounted(el, { value }, { transition }) {
    if (transition && value) {
      transition.enter(el);
    }
  },
  updated(el, { value, oldValue }, { transition }) {
    if (!value === !oldValue) return;
    if (transition) {
      if (value) {
        transition.beforeEnter(el);
        setDisplay(el, true);
        transition.enter(el);
      } else {
        transition.leave(el, () => {
          setDisplay(el, false);
        });
      }
    } else {
      setDisplay(el, value);
    }
  },
  beforeUnmount(el, { value }) {
    setDisplay(el, value);
  },
  // can not determine whether to use contentVisibility or display in SSR, so not adding this
  // SSR vnode transforms
  // getSSRProps({ value }) {
  //   if (!value) {
  //     return { style: { contentVisibility: 'hidden' } };
  //   }
  // },
};

if (__DEV__) {
  vContent.name = 'content';
}

function setDisplay(el: VShowElement, value: unknown): void {
  el.style[targetProp] = value ? el[vContentVisibilityOriginal] : targetValue;
  // for slot element, slotted content is still visible even if content-visibility: hidden, because slot has default display: contents
  // so we need to add display: block when content-visibility: hidden
  if (isHTMLSlotElement(el)) el.style.display = value ? el[vContentSlotDisplayOriginal] : 'block';
}
