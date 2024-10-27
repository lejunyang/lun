import {
  createImportDynamicStyle,
  getThemeValue,
  allColorSet,
  getHostStyle,
  ThemeProps,
} from '@lun-web/components';
import * as RadixColors from '@radix-ui/colors';
import { generateRadixColors } from './custom';
import { getVarName } from '../scss/utils';

export const importCustomDynamicColors = createImportDynamicStyle('common', (vm, name, context) => {
  const getTheme = (prop: keyof ThemeProps) => getThemeValue(vm, prop, context, name, true);
  const color = getTheme('color'),
    grayColor = getTheme('grayColor'),
    appearance = getTheme('appearance'),
    isDark = appearance === 'dark';

  const getKeywordColor = (name: string) => {
    // @ts-ignore
    return allColorSet.has(name) && RadixColors[name + (isDark ? 'Dark' : '')][name + '9'];
  };
  if ((color && !allColorSet.has(color)) || (grayColor && !allColorSet.has(grayColor))) {
    const { accentScale, accentScaleAlpha, accentContrast, accentSurface, grayScale, grayScaleAlpha } =
      generateRadixColors({
        appearance,
        accent: getKeywordColor(color) || color, // some keywords are not standard css colors(like slate, bronze)
        background: isDark ? '#111111' : '#FFFFFF',
        gray: getKeywordColor(grayColor) || grayColor,
      });
    return getHostStyle([
      ...accentScale.map((c, i) => [getVarName('accent', i + 1), c] as const),
      ...accentScaleAlpha.map((c, i) => [getVarName('accent', 'a' + (i + 1)), c] as const),
      ...grayScale.map((c, i) => [getVarName('gray', i + 1), c] as const),
      ...grayScaleAlpha.map((c, i) => [getVarName('gray', 'a' + (i + 1)), c] as const),
      [getVarName('color', 'surface', 'accent'), accentSurface],
      [getVarName('accent', '9', 'contrast'), accentContrast],
      [getVarName('color', 'focus'), accentScale[7]],
      [getVarName('color', 'selection'), accentScaleAlpha[4]],
      [getVarName('color', 'autofill'), accentScaleAlpha[2]],
    ]);
  }
  return '';
});
