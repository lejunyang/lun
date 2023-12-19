import { ShadowComponentKey } from '../components/config/config.static';

const root = 'root';
const label = 'label';
const input = 'input';
export const exportParts = {
  checkbox: [root, 'indicator', input, label],
  dialog: [root, 'overlay', 'panel', 'header', 'close', 'content', 'footer'],
  form: [root],
  'form-item': [root, label, 'content'],
  icon: ['svg'],
  input: [root, 'inner-input', label, 'addon-before', 'prefix', 'background', 'suffix', 'addon-after', 'tag-container'],
  popover: ['content', 'native', 'fixed', 'teleport-fixed'],
  radio: [root, label, 'indicator'],
  switch: [root, input, 'children', 'thumb'],
  tag: [root, 'icon'],
} as Record<ShadowComponentKey, string[]>;
