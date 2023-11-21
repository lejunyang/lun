import { Responsive } from '@lun/core';
import { ExtractPropTypes, PropType } from 'vue';

export const themeColors = Object.freeze([
  'gray',
  'gold',
  'bronze',
  'brown',
  'yellow',
  'amber',
  'orange',
  'tomato',
  'red',
  'ruby',
  'crimson',
  'pink',
  'plum',
  'purple',
  'violet',
  'iris',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'jade',
  'green',
  'grass',
  'lime',
  'mint',
  'sky',
] as const);

export const themeProps = {
  size: { type: [String, Object] as PropType<Responsive<'1' | '2' | '3'>> },
  color: { type: String as PropType<(typeof themeColors)[number]> },
  variant: { type: String as PropType<'solid' | 'soft' | 'surface' | 'outline'> },
  radius: { type: String as PropType<'none' | 'small' | 'medium' | 'large' | 'full'> },
  highContrast: { type: Boolean, default: undefined },
};

export type ThemeProps = ExtractPropTypes<typeof themeProps>;
