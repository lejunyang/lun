import { getViteConfig } from '../../utils/getViteConfig';

export default getViteConfig('@lun/core', {
  build: {
    lib: {
      entry: ['./index.ts', './src/presets/date.dayjs.ts'],
    },
  },
});
