import { getViteConfig, isIIFE } from '../../utils/getViteConfig';

export default getViteConfig('@lun-web/core', {
  build: {
    lib: {
      entry: isIIFE() ? './index-iife.ts' : ['./index.ts', './src/presets/date.dayjs.ts'],
    },
  },
});
