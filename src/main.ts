import { createApp } from 'vue';
import { importCommonStyle } from '@lun/theme';
import { GlobalStaticConfig } from '@lun/components';
import "@lun/theme/src/common/element.scss";
import './style.css';
import App from './App.vue';

importCommonStyle();
console.log('GlobalStaticConfig', GlobalStaticConfig);

createApp(App).mount('#app');
