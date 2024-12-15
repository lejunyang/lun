import { ExtractPropTypes } from 'vue';
import { OpenShadowComponentKey } from '../components';
import { freeze, objectKeys, pick } from '@lun-web/utils';
import { PropNumber, PropResponsive, PropString, undefBoolProp } from './propConstructor';
import { Status } from './type';

export const themeColors = freeze([
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

export const grayColors = freeze(['gray', 'mauve', 'slate', 'sage', 'olive', 'sand'] as const);

export const allColorSet = new Set<AllColors>(themeColors.concat(grayColors as any));

export const themeVariants = ['solid', 'soft', 'surface', 'outline', 'classic', 'ghost'] as const;

export const themeProps = freeze({
  size: PropResponsive<'1' | '2' | '3' | (string & {})>(),
  color: PropString<ThemeColors>(),
  status: PropString<Status>(),
  variant: PropString<ThemeVariants>(),
  radius: PropString<'none' | 'small' | 'medium' | 'large' | 'full'>(),
  highContrast: undefBoolProp,
  appearance: PropString<'light' | 'dark'>(),
  scale: PropNumber(),
  grayColor: PropString<GrayColors>(),
});

export type ThemeProps = ExtractPropTypes<typeof themeProps>;
export type ThemeConfig = {
  [key in keyof ThemeProps]: ThemeProps[key] | Record<OpenShadowComponentKey | 'common', ThemeProps[key]>;
};
export type ThemeColors = (typeof themeColors)[number] | (string & {});
export type GrayColors = (typeof grayColors)[number] | (string & {});
export type AllColors = ThemeColors | GrayColors;
export type ThemeVariants = (typeof themeVariants)[number] | (string & {});

export const pickThemeProps = (props: ThemeProps) => pick(props, objectKeys(themeProps));
