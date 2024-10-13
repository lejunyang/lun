import type { ObjectDirective } from '@vue/runtime-core';
import { supportCSSContentVisibility, isHTMLSlotElement } from '@lun/utils';

export const vContentVisibilityOriginal = Symbol(__DEV__ ? '_vcvo' : '');
export const vContentSlotDisplayOriginal = Symbol(__DEV__ ? '_vcvdo' : '');

export interface VShowElement extends HTMLElement {
  // _vocv = vue original content visibility
  [vContentVisibilityOriginal]: string;
  [vContentSlotDisplayOriginal]: string;
}

export const vContentTargetValue = supportCSSContentVisibility ? 'hidden' : 'none';
export const vContentTargetProp = supportCSSContentVisibility ? 'contentVisibility' : 'display';

/**
 * Using it like v-show to toggle content visibility of target element.
 * Remember that it is not equal to v-show, content-visibility:hidden is to skip its content, not itself.
 * Do not using it on elements with its own size(like elements with width, height or padding, svg elements),
 * on those elements, its content is not rendered, but element itself still has size in layout, which is different from display:none.
 * In such case, you can use v-content on its parent element.
 */
export const vContent: ObjectDirective<VShowElement> & { name?: 'content' } = {
  beforeMount(el, { value }, { transition }) {
    el[vContentVisibilityOriginal] = el.style[vContentTargetProp] === vContentTargetValue ? '' : el.style[vContentTargetProp];
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
  el.style[vContentTargetProp] = value ? el[vContentVisibilityOriginal] : vContentTargetValue;
  // for slot element, slotted content is still visible even if content-visibility: hidden, because slot has default display: contents
  // so we need to add display: block when content-visibility: hidden
  if (isHTMLSlotElement(el)) el.style.display = value ? el[vContentSlotDisplayOriginal] : 'block';
}
