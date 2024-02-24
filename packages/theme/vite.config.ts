// import postcssLogical from 'postcss-logical';
import { getViteConfig } from '../../utils/getViteConfig';

export default getViteConfig('@lun/theme', {
  css: {
    postcss: {
      // plugins: [postcssLogical()],
    },
  },
});
