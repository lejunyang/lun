import { fromObject } from '@lun/utils';
import { OpenShadowComponentKey } from '../components/config/config.static';

const root = 'root',
  label = 'label',
  input = 'input',
  content = 'content',
  children = 'children',
  icon = 'icon',
  thumb = 'thumb',
  wrapper = 'wrapper';

const toPartsDefine = <P extends { [k in OpenShadowComponentKey]: readonly string[] }, K extends keyof P = keyof P>(
  parts: P,
) => {
  return fromObject(parts, (k: string, v: string[]) => [
    k,
    v.reduce((res, p) => {
      (res as any)[p] = p + ' ' + k + '-' + p;
      return res;
    }, {}),
  ]) as {
    [k in K]: {
      [kk in P[k] extends readonly string[] ? P[k][number] : never]: k extends string ? `${kk} ${k}-${kk}` : never;
    };
  };
};

const toExportParts = <P extends { [k in OpenShadowComponentKey]: readonly string[] }, K extends keyof P = keyof P>(
  parts: P,
) => {
  return fromObject(parts, (k: string, v: string[]) => [
    k,
    Object.values(v)
      .map((p) => k + '-' + p)
      .join(','),
  ]) as {
    [k in K]: string;
  };
};

const parts = {
  button: [root, 'spin', 'hold'] as const,
  calendar: [root, content, 'head', 'body', 'cell', 'inner', wrapper] as const,
  callout: [root, icon, 'close-icon', content, 'message', 'description'] as const,
  checkbox: [root, 'indicator', input, label] as const,
  'checkbox-group': [root] as const,
  dialog: [root, 'mask', 'panel', 'header', 'close', content, 'footer'] as const,
  divider: [root, 'text'],
  'doc-pip': [],
  'file-picker': [],
  form: [root],
  'form-item': [root, label, content],
  icon: ['svg'],
  input: [
    root,
    'inner-input',
    label,
    'prepend',
    'wrapper',
    'prefix',
    'background',
    'renderer',
    'suffix',
    'length-info',
    'append',
    'tag-container',
    'steps-wrapper',
    'up',
    'down',
    'plus',
    'minus',
  ],
  mentions: [],
  message: [],
  popover: [content, 'native', 'fixed', 'teleport-fixed'],
  progress: [],
  radio: [root, label, 'indicator'],
  'radio-group': [],
  range: [root, thumb, 'rail', 'track', label, 'labels'] as const,
  select: [content],
  'select-optgroup': [root, label, children],
  'select-option': [root, label],
  spin: ['svg', 'circle', 'container', 'wrapper', 'mask', 'tip'],
  switch: [root, input, children, thumb],
  tag: [root, icon],
  'teleport-holder': [],
  textarea: [],
  'theme-provider': [],
  tooltip: [],
} satisfies Record<OpenShadowComponentKey, readonly string[]>;

export const partsDefine = toPartsDefine(parts);
export const exportParts = toExportParts(parts);
