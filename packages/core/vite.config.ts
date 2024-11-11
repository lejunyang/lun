import { getViteConfig, isIIFE } from '../../utils/getViteConfig';
import json from './package.json';

export default getViteConfig(
  '@lun-web/core',
  { version: json.version },
  {
    build: {
      lib: {
        entry: isIIFE() ? './index-iife.ts' : ['./index.ts', './src/presets/date.dayjs.ts'],
      },
    },
  },
);
