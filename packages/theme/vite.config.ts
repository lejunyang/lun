// import postcssLogical from 'postcss-logical';
import { getViteConfig, isIIFE } from '../../utils/getViteConfig';
import json from './package.json';

export default getViteConfig(
  '@lun-web/theme',
  { version: json.version },
  {
    css: {
      postcss: {
        // plugins: [postcssLogical()],
      },
    },
    build: {
      lib: {
        entry: isIIFE() ? './index.ts' : ['./index.ts', './src/custom/custom.ts'],
      },
    },
  },
);
