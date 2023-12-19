// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import Theme from 'vitepress/theme';
import { GlobalStaticConfig, defineAllComponents, importAllBasicStyles, registerCustomRenderer } from '@lun/components';
import '@lun/theme/scss/public/index.scss';
import {
  importCommonStyle,
  importBasicTheme,
  importSurfaceTheme,
  importOutlineTheme,
  importSoftTheme,
  importSolidTheme,
} from '@lun/theme';
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

    if (typeof document !== 'undefined') console.log('GlobalStaticConfig', GlobalStaticConfig);
    defineAllComponents();
  }) as (typeof Theme)['enhanceApp'],
};
