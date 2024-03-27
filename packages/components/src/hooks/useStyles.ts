import { copyCSSStyleSheetsIfNeed, isFunction, isSupportCSSStyleSheet, toArrayIfNotNil } from '@lun/utils';
import type { OpenShadowComponentKey } from 'config';
import { GlobalStaticConfig, componentsWithTeleport, useContextConfig } from 'config';
import { computed, getCurrentInstance, h, watchEffect } from 'vue';
import { onCEMount } from './shadowDom';
import { error } from '../utils/console';

export function useContextStyles(name: OpenShadowComponentKey) {
  const vm = getCurrentInstance()!;
  if (__DEV__ && !vm) {
    error('useContextStyles must be called inside setup()');
    return;
  }
  const dynamicStyles = useContextConfig('dynamicStyles');
  const styles = toArrayIfNotNil(dynamicStyles[name]).concat(() => (vm.props.innerStyle as string) || '');
  if (name === 'teleport-holder') {
    styles.push(...componentsWithTeleport.flatMap((name) => dynamicStyles[name]));
  }
  let sheets: CSSStyleSheet[] = [];
  const textStyles: (() => string)[] = [];
  const adopt = isSupportCSSStyleSheet() && GlobalStaticConfig.preferCSSStyleSheet;
  styles.forEach((s) => {
    if (!s) return;
    const css = !isFunction(s) ? () => String(s) : s;
    if (adopt) {
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
  onCEMount(({ shadowRoot }) => {
    if (sheets.length) {
      // copyCSSStyleSheetsIfNeed is for doc-pip component. when custom-element is moved to another document, it will throw an error: Sharing constructed stylesheets in multiple documents is not allowed
      // so we must check if the stylesheets are shared between documents, if so, we must clone them
      shadowRoot.adoptedStyleSheets.push(...copyCSSStyleSheetsIfNeed(sheets, shadowRoot));
    }
  });
  return computed(() => textStyles.map((i) => h('style', { type: 'text/css' }, i())));
}
