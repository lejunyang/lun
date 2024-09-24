import type { ObjectDirective } from '@vue/runtime-core';

export const vContentOriginal: unique symbol = Symbol(__DEV__ ? '_vocv' : '');

export interface VShowElement extends HTMLElement {
  // _vocv = vue original content visibility
  [vContentOriginal]: string;
}

const cProp = 'contentVisibility',
  dProp = 'display';
let targetValue: 'hidden' | 'none';
const targetProp =
  typeof document !== 'undefined' && cProp in document.body.style
    ? ((targetValue = 'hidden'), cProp)
    : ((targetValue = 'none'), dProp);

export const vContent: ObjectDirective<VShowElement> & { name?: 'content' } = {
  beforeMount(el, { value }, { transition }) {
    el[vContentOriginal] = el.style[targetProp] === targetValue ? '' : el.style[targetProp];
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
  el.style[targetProp] = value ? el[vContentOriginal] : targetValue;
}
