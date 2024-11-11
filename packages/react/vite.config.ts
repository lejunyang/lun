import { getViteConfig } from '../../utils/getViteConfig';
import react from '@vitejs/plugin-react';
import json from './package.json';

export default getViteConfig(
  '@lun-web/react',
  { version: json.version },
  {
    plugins: [react()],
  },
);
