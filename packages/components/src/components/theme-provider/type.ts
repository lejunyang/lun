import { ExtractPropTypes, PropType } from 'vue';
import { ThemeProps, themeProps } from 'common';
import { ShadowComponentKey } from '../config/config.static';

export const themeProviderProps = {
  ...Object.keys(themeProps).reduce(
    (acc, key) => {
      acc[key as keyof ThemeProps] = {} as any;
      return acc;
    },
    {} as {
      // -? means remove optional
      [key in keyof ThemeProps]-?: { type: PropType<ThemeProps[key] | Record<ShadowComponentKey | 'common', ThemeProps[key]>> };
    }
  ),
  grayColor: { type: String },
  scale: { type: String },
};

export type ThemeProviderSetupProps = ExtractPropTypes<typeof themeProviderProps>;
export type ThemeProviderProps = Partial<ThemeProviderSetupProps>;
