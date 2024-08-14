import { ExtractPropTypes } from 'vue';
import { OpenShadowComponentKey } from '../components';
import { objectKeys, pick } from '@lun/utils';
import { PropNumber, PropResponsive, PropString, undefBoolProp } from './propConstructor';
import { Status } from './type';

export const themeColors = [
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
] as const;

export const grayColors = ['gray', 'mauve', 'slate', 'sage', 'olive', 'sand'] as const;

export const themeVariants = ['solid', 'soft', 'surface', 'outline', 'classic', 'ghost'] as const;

export const themeProps = {
  size: PropResponsive<'1' | '2' | '3'>(),
  color: PropString<ThemeColors>(),
  status: PropString<Status>(),
  variant: PropString<ThemeVariants | string>(),
  radius: PropString<'none' | 'small' | 'medium' | 'large' | 'full'>(),
  highContrast: undefBoolProp,
  appearance: PropString<'light' | 'dark'>(),
  scale: PropNumber(),
  grayColor: PropString<GrayColors>(),
};

export type ThemeProps = ExtractPropTypes<typeof themeProps>;
export type ThemeConfig = {
  [key in keyof ThemeProps]: ThemeProps[key] | Record<OpenShadowComponentKey | 'common', ThemeProps[key]>;
};
export type ThemeColors = (typeof themeColors)[number];
export type GrayColors = (typeof grayColors)[number];
export type ThemeVariants = (typeof themeVariants)[number];

export const pickThemeProps = (props: ThemeProps) => pick(props, objectKeys(themeProps));
