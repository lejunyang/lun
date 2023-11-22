import { ShadowComponentKey } from '../components/config/config.static';

const root = 'root';
export const exportParts = {
  switch: [root, 'input', 'children', 'thumb'],
  tag: [root, 'icon'],
} as Record<ShadowComponentKey, string[]>;
