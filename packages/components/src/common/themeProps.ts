import { Responsive } from '@lun/core';
import { ExtractPropTypes, PropType } from 'vue';
import { ShadowComponentKey } from '../components';
import { pick } from '@lun/utils';

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

export const themeVariants = Object.freeze(['solid', 'soft', 'surface', 'outline', 'classic'] as const);

export const themeProps = {
  size: { type: [String, Object] as PropType<Responsive<'1' | '2' | '3'>> },
  color: { type: String as PropType<ThemeColors> },
  variant: { type: String as PropType<ThemeVariants | string> },
  radius: { type: String as PropType<'none' | 'small' | 'medium' | 'large' | 'full'> },
  highContrast: { type: Boolean, default: undefined },
  appearance: { type: String as PropType<'light' | 'dark'> },
};


export type ThemeProps = ExtractPropTypes<typeof themeProps>;
export type ThemeConfig = {
  [key in keyof ThemeProps]: ThemeProps[key] | Record<ShadowComponentKey | 'common', ThemeProps[key]>;
};
export type ThemeColors = (typeof themeColors)[number];
export type ThemeVariants = (typeof themeVariants)[number];

export const pickThemeProps = (props: ThemeProps) => pick(props, Object.keys(themeProps) as (keyof ThemeProps)[]);
