import { ExtractPropTypes, PropType } from 'vue';
import {
  CommonProps,
  editStateProps,
  GetEventPropsFromEmits,
  GrayColors,
  PropNumber,
  PropString,
  ThemeProps,
  themeProps,
} from 'common';
import { freeze, fromObject } from '@lun-web/utils';
import { OpenShadowComponentKey } from 'config';

export const themeProviderProps = freeze({
  ...editStateProps,
  ...(fromObject(themeProps, (key) => [key, {}]) as {
    // -? means remove optional
    [key in keyof ThemeProps]-?: {
      type: PropType<ThemeProps[key] | Record<OpenShadowComponentKey | 'common', ThemeProps[key]>>;
    };
  }),
  grayColor: PropString<GrayColors>(),
  scale: PropNumber(),
});

export const themeProviderEmits = freeze({});

export type ThemeProviderSetupProps = ExtractPropTypes<typeof themeProviderProps> & CommonProps;
export type ThemeProviderEvents = GetEventPropsFromEmits<typeof themeProviderEmits>;
export type ThemeProviderProps = Partial<ThemeProviderSetupProps>;
