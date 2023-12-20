import { ShadowComponentKey } from '../components/config/config.static';

const root = 'root';
const label = 'label';
const input = 'input';
const content = 'content';
const children = 'children';
export const exportParts = {
  checkbox: [root, 'indicator', input, label],
  dialog: [root, 'overlay', 'panel', 'header', 'close', content, 'footer'],
  form: [root],
  'form-item': [root, label, content],
  icon: ['svg'],
  input: [root, 'inner-input', label, 'addon-before', 'prefix', 'background', 'suffix', 'addon-after', 'tag-container'],
  popover: [content, 'native', 'fixed', 'teleport-fixed'],
  radio: [root, label, 'indicator'],
  select: [content],
  'select-optgroup': [root, label, children],
  'select-option': [root, label],
  switch: [root, input, children, 'thumb'],
  tag: [root, 'icon'],
} as Record<ShadowComponentKey, string[]>;
