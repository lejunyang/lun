import { copyCSSStyleSheetsIfNeed, runIfFn, isSupportCSSStyleSheet, toArrayIfNotNil } from '@lun/utils';
import type { OpenShadowComponentKey } from 'config';
import { GlobalStaticConfig, componentsWithTeleport, useContextConfig } from 'config';
import { computed, getCurrentInstance, h, watchEffect } from 'vue';
import { onCEMount } from './shadowDom';
import { error } from '../utils/console';
import { processStringStyle } from 'utils';

export function useContextStyles(name: OpenShadowComponentKey) {
  const vm = getCurrentInstance()!;
  if (__DEV__ && !vm) {
    error('useContextStyles must be called inside setup()');
    return;
  }
  const context = useContextConfig();
  const { dynamicStyles } = context;
  const styles = toArrayIfNotNil(dynamicStyles.common)
    .concat(toArrayIfNotNil(dynamicStyles[name]))
    .concat(() => (vm.props.innerStyle as string) || '');
  if (name === 'teleport-holder') {
    styles.push(...componentsWithTeleport.flatMap((name) => dynamicStyles[name]));
  }
  const sheets: (CSSStyleSheet & { _clone?: CSSStyleSheet; _css: () => string })[] = [];
  const textStyles: (() => string)[] = [];
  const adopt = isSupportCSSStyleSheet() && GlobalStaticConfig.preferCSSStyleSheet;
  styles.forEach((s) => {
    if (!s) return;
    const css = () => processStringStyle(runIfFn(s, vm, name, context), true);
    if (adopt) {
      const sheet = new CSSStyleSheet() as CSSStyleSheet & { _clone?: CSSStyleSheet; _css: () => string };
      sheet._css = css;
      sheets.push(sheet);
    } else {
      textStyles.push(css);
    }
  });
  watchEffect(() => {
    sheets.forEach((s) => {
      s.replaceSync(s._css());
      if (s._clone) {
        s._clone.replaceSync(s._css());
      }
    });
  });
  onCEMount(({ shadowRoot }) => {
    if (sheets.length) {
      // TODO 或许不用管clone，或许可以通过vm.CE去获取window的CSSStyleSheet，这样就不用克隆了
      // copyCSSStyleSheetsIfNeed is for doc-pip component. when custom-element is moved to another document, it will throw an error: Sharing constructed stylesheets in multiple documents is not allowed
      // so we must check if the stylesheets are shared between documents, if so, we must clone them
      const cloned = copyCSSStyleSheetsIfNeed(sheets, shadowRoot);
      // attach cloned sheet to original sheet, so that it can be updated in watchEffect
      cloned.forEach((s, i) => {
        if (s !== sheets[i]) {
          sheets[i]._clone = s;
        }
      });
      shadowRoot.adoptedStyleSheets.push(...cloned);
    }
  });
  return computed(() => textStyles.map((i) => h('style', { type: 'text/css' }, i())));
}
