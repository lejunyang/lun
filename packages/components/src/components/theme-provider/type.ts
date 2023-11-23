import { ExtractPropTypes } from 'vue';
import { themeProps } from 'common';

export const themeProviderProps = {
  ...themeProps,
  grayColor: { type: String },
  scale: { type: String },
};

export type ThemeProviderProps = ExtractPropTypes<typeof themeProviderProps>;
