import { isFunction, supportCSSStyleSheet } from '@lun/utils';
import type { ComponentKey } from 'config';
import { GlobalStaticConfig, useContextConfig } from 'config';
import type { ComputedRef } from 'vue';
import { computed, getCurrentInstance, h, watchEffect } from 'vue';
import { useShadowDom } from './shadowDom';

export function useContextStyles(name: ComponentKey) {
  const vm = getCurrentInstance();
  // TODO add __DEV__
  if (!vm) {
    return;
  }
  const dynamicStyles = useContextConfig('dynamicStyles');
  const styles = dynamicStyles[name];
  if (!Array.isArray(styles)) return;
  const sheets: CSSStyleSheet[] = [];
  const textStyles: ComputedRef<string>[] = [];
  const support = supportCSSStyleSheet();
  styles.forEach((css) => {
    if (!isFunction(css)) return;
    if (support && GlobalStaticConfig.preferCSSStyleSheet) {
      const sheet = new CSSStyleSheet();
      watchEffect(() => {
        const result = css(vm);
        result && sheet.replaceSync(String(result));
      });
      sheets.push(sheet);
    } else {
      textStyles.push(computed(() => css(vm)));
    }
  });
  useShadowDom(({ shadowRoot }) => {
    shadowRoot.adoptedStyleSheets = shadowRoot.adoptedStyleSheets.concat(sheets);
  });
  return () => textStyles.map((i) => h('style', { type: 'text/css' }, i.value));
}
