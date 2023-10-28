import { isFunction, isSupportCSSStyleSheet } from '@lun/utils';
import type { ShadowComponentKey } from 'config';
import { GlobalStaticConfig, useContextConfig } from 'config';
import { computed, getCurrentInstance, h, watchEffect } from 'vue';
import { useShadowDom } from './shadowDom';

export function useContextStyles(name: ShadowComponentKey) {
  const vm = getCurrentInstance();
  // TODO add __DEV__
  if (!vm) {
    return;
  }
  const dynamicStyles = useContextConfig('dynamicStyles');
  const styles = dynamicStyles[name];
  if (!Array.isArray(styles)) return;
  const sheets: CSSStyleSheet[] = [];
  const textStyles: (() => string)[] = [];
  const support = isSupportCSSStyleSheet();
  styles.forEach((s) => {
    if (!s) return;
    const css = !isFunction(s) ? () => String(s) : s;
    if (support && GlobalStaticConfig.preferCSSStyleSheet) {
      const sheet = new CSSStyleSheet();
      watchEffect(() => {
        const result = css(vm);
        result && sheet.replaceSync(String(result));
      });
      sheets.push(sheet);
    } else {
      textStyles.push(() => css(vm));
    }
  });
  useShadowDom(({ shadowRoot }) => {
    shadowRoot.adoptedStyleSheets = shadowRoot.adoptedStyleSheets.concat(sheets);
  });
  return computed(() => textStyles.map((i) => h('style', { type: 'text/css' }, i())));
}
