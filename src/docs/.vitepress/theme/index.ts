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
import Layout from './Layout.vue';
import Code from '../../../components/Code.vue';
import Support from '../../../components/Support.vue';
import './style.css';

let once = false;

export default {
  extends: Theme,
  Layout: () => h(Layout),
  enhanceApp: (({ app }) => {
    if (once) return false;
    once = true;

    app.component('Code', Code);
    app.component('Support', Support);
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
    }
  }) as (typeof Theme)['enhanceApp'],
};
