import { getViteConfig } from '../../utils/getViteConfig';
import json from './package.json';

export default getViteConfig('@lun-web/utils', { version: json.version });
