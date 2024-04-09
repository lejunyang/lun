import { ExtractPropTypes, PropType } from 'vue';
import { editStateProps, GrayColors, PropString, ThemeProps, themeProps } from 'common';
import { OpenShadowComponentKey } from '../config/config.static';

export const themeProviderProps = {
  ...editStateProps,
  ...Object.keys(themeProps).reduce(
    (acc, key) => {
      acc[key as keyof ThemeProps] = {} as any;
      return acc;
    },
    {} as {
      // -? means remove optional
      [key in keyof ThemeProps]-?: {
        type: PropType<ThemeProps[key] | Record<OpenShadowComponentKey | 'common', ThemeProps[key]>>;
      };
    },
  ),
  grayColor: PropString<GrayColors>(),
  scale: PropString(),
};

export type ThemeProviderSetupProps = ExtractPropTypes<typeof themeProviderProps>;
export type ThemeProviderProps = Partial<ThemeProviderSetupProps>;
