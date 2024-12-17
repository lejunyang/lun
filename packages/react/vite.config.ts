import { getViteConfig } from '../../utils/getViteConfig';
import react from '@vitejs/plugin-react';
import json from './package.json';
import fs from 'node:fs';

const buildForReact19AndLater = process.env.REACT19 === 'true';

if (buildForReact19AndLater) {
  // found dts plugin reads package.json first, if it finds types field, it will use it as outDir and ignore my configuration... so temporarily change the types field
  json.types = './dist/19/index19.d.ts';
  fs.writeFileSync('./package.json', JSON.stringify(json, null, 2));
}

export default getViteConfig(
  '@lun-web/react',
  {
    version: json.version,
    dtsOptions: buildForReact19AndLater
      ? {
          outDir: './dist/19',
          afterBuild() {
            // restore types field
            json.types = './dist/index.d.ts';
            fs.writeFileSync('./package.json', JSON.stringify(json, null, 2));
          },
        }
      : undefined,
  },
  {
    plugins: [react()],
    build: {
      lib: {
        entry: buildForReact19AndLater ? './index19.ts' : './index.ts',
      },
      outDir: buildForReact19AndLater ? 'dist/19' : 'dist',
    },
  },
);
