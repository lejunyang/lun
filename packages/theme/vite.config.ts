// import postcssLogical from 'postcss-logical';
import { getViteConfig, isIIFE } from '../../utils/getViteConfig';

export default getViteConfig('@lun-web/theme', {
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
});
