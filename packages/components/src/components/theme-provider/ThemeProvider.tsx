import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { themeProviderProps } from './type';
import { provideContextConfig } from '../config';
import { provide } from 'vue';

export const ThemeProviderKey = Symbol(__DEV__ ? 'ThemeProviderKey' : '');

const name = 'theme-provider';
export const ThemeProvider = defineSSRCustomElement({
  name,
  props: themeProviderProps,
  noShadow: true,
  inheritAttrs: false,
  onCE(_, el, parent) {
    const isRoot = !parent || !parent._instance?.provides[ThemeProviderKey];
    el.toggleAttribute('root', isRoot);
  },
  setup(props) {
    provide(ThemeProviderKey, true);
    provideContextConfig({
      theme: props,
    });
    return () => null;
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LThemeProvider: typeof ThemeProvider;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-theme-provider': typeof ThemeProvider;
  }
}

export const defineThemeProvider = createDefineElement(name, ThemeProvider);
