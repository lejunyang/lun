import { ShadowComponentKey } from '../components/config/config.static';

const root = 'root';
const label = 'label';
const input = 'input';
export const exportParts = {
  checkbox: [root, 'indicator', input, label],
  dialog: [root, 'overlay', 'panel', 'header', 'close', 'content', 'footer'],
  switch: [root, input, 'children', 'thumb'],
  tag: [root, 'icon'],
} as Record<ShadowComponentKey, string[]>;
