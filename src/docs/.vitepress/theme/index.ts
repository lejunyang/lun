// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import Theme from 'vitepress/theme';
import { GlobalStaticConfig, defineAllComponents, importAllBasicStyles, registerCustomRenderer } from '@lun/components';
import '@lun/theme/scss/public/index.scss';
import { isValidElement } from 'react';
import { createRoot } from 'react-dom/client';
import { importBasicTheme, importSurfaceTheme } from '@lun/theme';
import Layout from './Layout.vue';
import './style.css';

export default {
  extends: Theme,
  Layout: () => h(Layout),
  enhanceApp({ app, router, siteData }) {
    importAllBasicStyles();
    importBasicTheme();
    importSurfaceTheme();

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
        reactRootMap.get(target)?.unmount();
      },
    });

    if (typeof document !== 'undefined') console.log('GlobalStaticConfig', GlobalStaticConfig);
    defineAllComponents();
    // ...
  },
};
