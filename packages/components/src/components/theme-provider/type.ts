import { ExtractPropTypes, PropType } from 'vue';

export const themeProviderProps = {
  theme: { type: String },
  appearance: { type: String as PropType<'light' | 'dark'> },
  accentColor: { type: String },
  scale: { type: String },
};

export type ThemeProviderProps = ExtractPropTypes<typeof themeProviderProps>;
