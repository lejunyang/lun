// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import Theme from 'vitepress/theme';
import { GlobalStaticConfig, GlobalContextConfig, defineAllComponents } from '@lun-web/components';
import { importAllThemes, importAllColors, importAllP3Colors } from '@lun-web/theme';
import { inBrowser } from 'vitepress';
import '@lun-web/core/date-dayjs';
import { importCustomDynamicColors } from '@lun-web/theme/custom';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { Dayjs } from '@lun-web/core/date-dayjs';
import { vContent } from '@lun-web/plugins/vue';
import Layout from '../../../components/Layout.vue';
import Code from '../../../components/Code.vue';
import Support from '../../../components/Support.vue';
import SupportInfo from '../../../components/SupportInfo.vue';
import CompThemePanel from '../../../components/CompThemePanel';
import Playground from '../../../components/Playground.vue';
import './style.css';
import { once } from '@lun-web/utils';
// import { on } from '@lun-web/utils';

declare module '@lun-web/core' {
  export interface DateInterface {
    date: Dayjs;
  }
}

const deployedOn = (typeof process !== 'undefined' && process.env.DEPLOYED_ON) || import.meta.env.DEPLOYED_ON;

const injectOnce = once(() => {
  if (!inBrowser || deployedOn !== 'vercel') return;
  inject();
  injectSpeedInsights();
});

export default {
  extends: Theme,
  Layout: () => h(Layout),
  enhanceApp: (({ app }) => {
    app.directive('content', vContent);
    app.component('Code', Code);
    app.component('Support', Support);
    app.component('SupportInfo', SupportInfo);
    app.component('CompThemePanel', CompThemePanel);
    app.component('Playground', Playground);
    app.config.warnHandler = (msg, _vm, _trace) => {
      // ignore injection not found warning
      if (msg.includes('injection') && msg.includes('not found')) return;
      // not sure if it needs to be ignored, it occurred since upgraded to vue 3.5
      if (msg.includes('Performing full mount instead')) return;
      console.warn(msg, _vm, _trace);
    };

    importAllColors();
    importAllP3Colors();
    importAllThemes();
    importCustomDynamicColors();

    GlobalStaticConfig.reflectStateToAttr = 'always';
    if (inBrowser) {
      injectOnce();

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
