import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { themeProviderProps } from './type';
import { provideContextConfig } from '../config';
import { provide, reactive, watchEffect } from 'vue';
import { useSetupEdit } from '@lun-web/core';

export const ThemeProviderKey = Symbol(__DEV__ ? 'ThemeProviderKey' : '');

const name = 'theme-provider';
export const ThemeProvider = defineSSRCustomElement({
  name,
  props: themeProviderProps,
  // shadowOptions: null, // it will cause Hydration children mismatch as it will render a comment node on client side, so render a slot instead of render undefine
  onCE(_, el, parent) {
    const isRoot = !parent || !parent._instance?.provides[ThemeProviderKey];
    el.toggleAttribute('data-root-' + name, isRoot);
  },
  setup(props) {
    provide(ThemeProviderKey, true);

    const theme = reactive({}) as any;
    watchEffect(() => {
      for (const [key, value] of Object.entries(props)) {
        if (value != null) theme[key] = value;
        // need to delete the key when it's nil, as provideContextConfig relies on object prototype. If we don't delete the key, it will always use it, not the parent's
        else delete theme[key];
      }
    });
    provideContextConfig({
      theme,
    });
    useSetupEdit();
    // return () => undefined;
    return () => <slot></slot>;
  },
});

export type tThemeProvider = typeof ThemeProvider;
export type iThemeProvider = InstanceType<tThemeProvider>;

export const defineThemeProvider = createDefineElement(name, ThemeProvider);
