// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import Theme from 'vitepress/theme';
import { GlobalStaticConfig, GlobalContextConfig, defineAllComponents, registerCustomRenderer } from '@lun/components';
import {
  importCommonTheme,
  importBasicTheme,
  importSurfaceTheme,
  importOutlineTheme,
  importSoftTheme,
  importSolidTheme,
  importGhostTheme,
} from '@lun/theme';
import { inBrowser } from 'vitepress';
import '@lun/core/date-dayjs';
import { Dayjs } from '@lun/core/date-dayjs';
import Layout from './Layout.vue';
import Code from '../../../components/Code.vue';
import Support from '../../../components/Support.vue';
import SupportInfo from '../../../components/SupportInfo.vue';
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

    app.component('Code', Code);
    app.component('Support', Support);
    app.component('SupportInfo', SupportInfo);
    app.config.warnHandler = (msg, _vm, _trace) => {
      // ignore injection not found warning
      if (msg.includes('injection') && msg.includes('not found')) return;
      console.warn(msg);
    };

    importCommonTheme();
    importBasicTheme();
    importOutlineTheme();
    importSoftTheme();
    importSolidTheme();
    importSurfaceTheme();
    importGhostTheme();

    // lazy import react
    (async () => {
      const {
        default: { isValidElement, cloneElement },
      } = await import('react');
      const {
        default: { createRoot },
      } = await import('react-dom/client');
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

    GlobalStaticConfig.reflectStateToAttr = 'always';
    if (inBrowser) {
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
