
import { themeProviderEmits, ThemeProviderProps, themeProviderProps, defineThemeProvider, iThemeProvider } from '@lun/components';
import createComponent from '../createComponent';

export const LThemeProvider = createComponent<ThemeProviderProps, iThemeProvider>('theme-provider', defineThemeProvider, themeProviderProps, themeProviderEmits);
if (__DEV__) LThemeProvider.displayName = 'LThemeProvider';
