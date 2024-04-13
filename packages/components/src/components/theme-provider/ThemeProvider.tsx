import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { themeProviderProps } from './type';
import { provideContextConfig } from '../config';
import { provide } from 'vue';
import { useSetupEdit } from '@lun/core';

export const ThemeProviderKey = Symbol(__DEV__ ? 'ThemeProviderKey' : '');

const name = 'theme-provider';
export const ThemeProvider = defineSSRCustomElement({
  name,
  props: themeProviderProps,
  // shadowOptions: null, // it will cause Hydration children mismatch as it will render a comment node on client side
  onCE(_, el, parent) {
    const isRoot = !parent || !parent._instance?.provides[ThemeProviderKey];
    el.toggleAttribute('root', isRoot);
  },
  setup(props) {
    provide(ThemeProviderKey, true);
    provideContextConfig({
      theme: props,
    });
    useSetupEdit();
    // return () => undefined;
    return () => <slot></slot>;
  },
});

export type tThemeProvider = typeof ThemeProvider;
export type iThemeProvider = InstanceType<tThemeProvider>;

export const defineThemeProvider = createDefineElement(name, ThemeProvider);
