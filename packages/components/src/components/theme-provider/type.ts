import { ExtractPropTypes, PropType } from 'vue';
import {
  CommonProps,
  editStateProps,
  GetEventPropsFromEmits,
  GrayColors,
  PropString,
  ThemeProps,
  themeProps,
} from 'common';
import { OpenShadowComponentKey } from '../config/config.static';
import { freeze } from '@lun/utils';

export const themeProviderProps = freeze({
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
});

export const themeProviderEmits = freeze({});

export type ThemeProviderSetupProps = ExtractPropTypes<typeof themeProviderProps> & CommonProps;
export type ThemeProviderEvents = GetEventPropsFromEmits<typeof themeProviderEmits>;
export type ThemeProviderProps = Partial<ThemeProviderSetupProps>;
