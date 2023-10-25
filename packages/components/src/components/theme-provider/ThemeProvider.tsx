import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { themeProviderProps } from './type';
import { GlobalStaticConfig } from '..';

export const ThemeProvider = defineSSRCustomElement({
  name: 'theme-provider',
  props: themeProviderProps,
  noShadow: true,
  inheritAttrs: false,
  // onPropUpdate(key, val, el) {
  //   if (key === 'dark') {
  //     el.classList.toggle(`${GlobalStaticConfig.namespace}-dark-theme`, val);
  //     el.classList.toggle(`${GlobalStaticConfig.namespace}-light-theme`, !val);
  //   }
  // },
  // onCE(_, el) {
  //   el.classList.add(`${GlobalStaticConfig.namespace}-theme`);
  // },
  setup(props) {
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

export const defineThemeProvider = createDefineElement('theme-provider', ThemeProvider);
