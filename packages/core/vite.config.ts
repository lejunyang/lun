import { getViteConfig } from '../../utils/getViteConfig';

export default getViteConfig('@lun-web/core', {
  build: {
    lib: {
      entry: ['./index.ts', './src/presets/date.dayjs.ts'],
    },
  },
});
