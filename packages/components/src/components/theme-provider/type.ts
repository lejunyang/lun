import { ExtractPropTypes } from "vue"

export const themeProviderProps = {
  theme: { type: String },
  dark: { type: Boolean },
  accentColor: { type: String },
  scale: { type: String },
}

export type ThemeProviderProps = ExtractPropTypes<typeof themeProviderProps>