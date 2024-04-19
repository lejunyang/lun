import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { themeProviderProps } from './type';
import { provideContextConfig } from '../config';
import { provide } from 'vue';
import { useSetupEdit } from '@lun/core';
import { useNamespace } from 'hooks';

export const ThemeProviderKey = Symbol(__DEV__ ? 'ThemeProviderKey' : '');

const name = 'theme-provider';
export const ThemeProvider = defineSSRCustomElement({
  name,
  props: themeProviderProps,
  // shadowOptions: null, // it will cause Hydration children mismatch as it will render a comment node on client side, so render a slot instead of render undefine
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
    const ns = useNamespace(name);
    // return () => undefined;
    return () => (
      <>
        <style>{`:host{${ns.vn('scale', false)}:${props.scale}`}</style>
        <slot></slot>
      </>
    );
  },
});

export type tThemeProvider = typeof ThemeProvider;
export type iThemeProvider = InstanceType<tThemeProvider>;

export const defineThemeProvider = createDefineElement(name, ThemeProvider);
