import { defineThemeProvider, ThemeProviderProps, iThemeProvider } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LThemeProvider = createComponent<ThemeProviderProps, iThemeProvider>('theme-provider', defineThemeProvider);
if (__DEV__) LThemeProvider.displayName = 'LThemeProvider';
