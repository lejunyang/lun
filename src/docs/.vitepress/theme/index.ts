// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import Theme from 'vitepress/theme';
import { importCommonStyle } from '@lun/theme';
import { GlobalStaticConfig, defineAllComponents, importAllBasicStyles, registerCustomRenderer } from '@lun/components';
import '@lun/theme/scss/common/index.scss';
import { isValidElement } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

export default {
  extends: Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app, router, siteData }) {
    importAllBasicStyles();
    importCommonStyle();

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

    console.log('GlobalStaticConfig', GlobalStaticConfig);
    defineAllComponents();
    // ...
  },
};
