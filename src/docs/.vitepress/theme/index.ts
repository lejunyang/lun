// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import Theme from 'vitepress/theme';
import {
  GlobalStaticConfig,
  GlobalContextConfig,
  defineAllComponents,
  importAllBasicStyles,
  registerCustomRenderer,
} from '@lun/components';
import '@lun/theme/scss/public/index.scss';
import {
  importCommonStyle,
  importBasicTheme,
  importSurfaceTheme,
  importOutlineTheme,
  importSoftTheme,
  importSolidTheme,
} from '@lun/theme';
import { inBrowser } from 'vitepress';
import Layout from './Layout.vue';
import Code from '../../../components/Code.vue';
import './style.css';

let once = false;

export default {
  extends: Theme,
  Layout: () => h(Layout),
  enhanceApp: (({ app }) => {
    if (once) return false;
    once = true;

    app.component('Code', Code);
    app.config.warnHandler = (msg, _vm, _trace) => {
      // ignore injection not found warning
      if (msg.includes('injection') && msg.includes('not found')) return;
      console.warn(msg);
    };

    importCommonStyle();
    importAllBasicStyles();
    importBasicTheme();
    importOutlineTheme();
    importSoftTheme();
    importSolidTheme();
    importSurfaceTheme();

    // lazy import react
    (async () => {
      const {
        default: { isValidElement },
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
