// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import Theme from 'vitepress/theme';
import { importCommonStyle } from '@lun/theme';
import { GlobalStaticConfig, defineAllComponents, importAllBasicStyles } from '@lun/components';
import '@lun/theme/scss/common/index.scss';
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
    console.log('GlobalStaticConfig', GlobalStaticConfig);
    defineAllComponents();
    // ...
  },
};
