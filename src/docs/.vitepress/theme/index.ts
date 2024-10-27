// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import Theme from 'vitepress/theme';
import { GlobalStaticConfig, GlobalContextConfig, defineAllComponents, registerCustomRenderer } from '@lun/components';
import { importAllThemes, importAllColors, importAllP3Colors } from '@lun/theme';
import { inBrowser } from 'vitepress';
import '@lun/core/date-dayjs';
import { importCustomDynamicColors } from '@lun/theme/custom';
import { Dayjs } from '@lun/core/date-dayjs';
import { vContent } from '@lun/plugins/vue';
import Layout from '../../../components/Layout.vue';
import Palette from '../../../components/Palette.vue';
import Code from '../../../components/Code.vue';
import Support from '../../../components/Support.vue';
import SupportInfo from '../../../components/SupportInfo.vue';
import CompThemePanel from '../../../components/CompThemePanel.vue';
import './style.css';
// import { on } from '@lun/utils';

let once = false;

declare module '@lun/core' {
  export interface DateInterface {
    date: Dayjs;
  }
}

export default {
  extends: Theme,
  Layout: () => h(Layout),
  enhanceApp: (({ app }) => {
    if (once) return false;
    once = true;

    app.directive('content', vContent);
    app.component('Code', Code);
    app.component('Palette', Palette);
    app.component('Support', Support);
    app.component('SupportInfo', SupportInfo);
    app.component('CompThemePanel', CompThemePanel);
    app.config.warnHandler = (msg, _vm, _trace) => {
      // ignore injection not found warning
      if (msg.includes('injection') && msg.includes('not found')) return;
      // not sure if it needs to be ignored, it occurred since upgraded to vue 3.5
      if (msg.includes('Attempting to hydrate existing markup but container is empty. Performing full mount instead'))
        return;
      console.warn(msg, _vm, _trace);
    };

    importAllColors();
    importAllP3Colors();
    importAllThemes();
    importCustomDynamicColors();

    GlobalStaticConfig.reflectStateToAttr = 'always';
    if (inBrowser) {
      // lazy import react
      (async () => {
        const { isValidElement, cloneElement } = await import('react');
        const { createRoot } = await import('react-dom/client');
        const reactRootMap = new WeakMap();
        registerCustomRenderer('react', {
          isValidContent(content) {
            return isValidElement(content);
          },
          onMounted(content, target) {
            if (reactRootMap.has(target)) return;
            const root = createRoot(target);
            reactRootMap.set(target, root);
            root.render(content);
          },
          onUpdated(content, target) {
            reactRootMap.get(target)?.render(content);
          },
          onBeforeUnmount(target) {
            reactRootMap.get(target)?.unmount(); // TODO what will happen if unmount and then mount again?
            reactRootMap.delete(target);
          },
          clone(content) {
            return cloneElement(content);
          },
        });
      })();

      console.log('GlobalStaticConfig', GlobalStaticConfig);
      console.log('GlobalContextConfig', GlobalContextConfig);
      Object.assign(window, { GlobalStaticConfig, GlobalContextConfig });
      defineAllComponents();
      // const observer = new PerformanceObserver((list) => {
      //   for (const entry of list.getEntries()) {
      //     console.debug(entry.entryType + ' performance issue observed', entry);
      //   }
      // });
      // observer.observe({ entryTypes: ['longtask', 'long-animation-frame', 'event'] });
      // // Load when the page is activated
      // on(document, 'prerenderingchange', () => {
      //   console.debug(`The page has been activated!`);

      //   const activationStart = Math.round((performance.getEntriesByType('navigation')[0] as any).activationStart);
      //   console.debug(`The page was activated at: ${activationStart}`);
      // });
    }
  }) as (typeof Theme)['enhanceApp'],
};
