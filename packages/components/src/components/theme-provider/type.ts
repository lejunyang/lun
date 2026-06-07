import { ExtractPropTypes, PropType } from 'vue';
import {
  CommonProps,
  editStateProps,
  GetEventMapFromEmits,
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
  /**
   * @locale.zh-CN 灰色调，用于设置主题中的中性灰色系列
   * @locale.en Gray color scale used as the neutral palette of the theme
   */
  grayColor: PropString<GrayColors>(),
  /**
   * @locale.zh-CN 缩放比例，正数，建议在 0.9 ~ 1.1 之间，会影响间距、字体大小、圆角等数值，并非 transform: scale
   * @locale.en Scale factor, a positive number recommended between 0.9 and 1.1; affects spacing, font size, radius, etc., not CSS transform: scale
   */
  scale: PropNumber(),
});

export const themeProviderEmits = freeze({});

export type ThemeProviderSetupProps = ExtractPropTypes<typeof themeProviderProps> & CommonProps;
export type ThemeProviderEventProps = GetEventPropsFromEmits<typeof themeProviderEmits>;
export type ThemeProviderEventMap = GetEventMapFromEmits<typeof themeProviderEmits>;
export type ThemeProviderProps = Partial<ThemeProviderSetupProps> & ThemeProviderEventProps;
