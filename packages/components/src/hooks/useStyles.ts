import { copyCSSStyleSheetsIfNeed, runIfFn, isSupportCSSStyleSheet, ensureArray, getWindow } from '@lun/utils';
import type { OpenShadowComponentKey } from 'config';
import { GlobalStaticConfig, componentsWithTeleport, useContextConfig } from 'config';
import { computed, getCurrentInstance, h, watchEffect } from 'vue';
import { useCE } from './shadowDom';
import { error } from '../utils/console';
import { processStringStyle } from 'utils';

export function useContextStyles(name: OpenShadowComponentKey) {
  const vm = getCurrentInstance()!;
  if (__DEV__ && !vm) {
    error('useContextStyles must be called inside setup()');
    return;
  }
  const CE = useCE(),
    root = CE.shadowRoot!,
    SheetConstructor = getWindow(CE).CSSStyleSheet;
  const context = useContextConfig(),
    { dynamicStyles } = context;
  const styles = ensureArray(dynamicStyles.common)
    .concat(ensureArray(dynamicStyles[name]))
    .concat(() => (vm.props.innerStyle as string) || '');

  if (name === 'teleport-holder') {
    styles.push(...componentsWithTeleport.flatMap((name) => dynamicStyles[name]));
  }
  const sheets: [CSSStyleSheet, getCSS: () => string][] = [];
  const textStyles: (() => string)[] = [];
  const adopt = isSupportCSSStyleSheet() && GlobalStaticConfig.preferCSSStyleSheet;
  styles.forEach((s) => {
    if (!s) return;
    const css = () => processStringStyle(runIfFn(s, vm, name, context), false, true);
    if (adopt) {
      const sheet = new SheetConstructor();
      sheets.push([sheet, css]);
    } else {
      textStyles.push(css);
    }
  });
  watchEffect(() => {
    sheets.forEach(([s, css]) => {
      const text = css();
      s.replaceSync(text);
    });
  });
  if (sheets.length) {
    // copyCSSStyleSheetsIfNeed is for doc-pip component. when custom-element is moved to another document, it will throw an error: Sharing constructed stylesheets in multiple documents is not allowed
    // so we must check if the stylesheets are shared between documents, if so, we must clone them
    const cloned = copyCSSStyleSheetsIfNeed(
      sheets.map(([i]) => i),
      CE,
    );
    root.adoptedStyleSheets.push(...cloned);
  }
  return computed(() => textStyles.map((i) => h('style', {}, i())));
}
