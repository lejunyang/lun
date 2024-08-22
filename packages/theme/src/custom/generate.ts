import {
  createImportDynamicStyle,
  getThemeValue,
  GlobalStaticConfig,
  TGlobalContextConfig,
  allColorSet,
} from '@lun/components';
import * as RadixColors from '@radix-ui/colors';
import { generateRadixColors } from './custom';

export const importCustomDynamicColors = createImportDynamicStyle('common', (vm, name, context) => {
  const { namespace } = context as TGlobalContextConfig;
  const n = namespace || GlobalStaticConfig.namespace;
  const { commonSeparator } = GlobalStaticConfig;
  const getTheme = (prop: string) => getThemeValue(vm, prop, context, name);
  const color = getTheme('color'),
    grayColor = getTheme('grayColor');
  const appearance = getTheme('appearance'),
    isDark = appearance === 'dark';
  function getVar(list: (string | number)[], value: string) {
    return '--' + n + commonSeparator + list.join(commonSeparator) + ':' + value + ';';
  }

  const getKeywordColor = (name: string) => {
    // @ts-ignore
    return allColorSet.has(name) && RadixColors[name + (isDark ? 'Dark' : '')][name + '9'];
  };
  if ((color && !allColorSet.has(color)) || (grayColor && !allColorSet.has(grayColor))) {
    const { accentScale, accentScaleAlpha, accentContrast, accentSurface } = generateRadixColors({
      appearance,
      accent: getKeywordColor(color) || color, // some keywords are not standard css colors(like slate, bronze)
      background: isDark ? '#111111' : '#FFFFFF',
      gray: getKeywordColor(grayColor) || grayColor,
    });
    return `:host{${accentScale.map((c, i) => `${getVar(['accent', i + 1], c)}`).join('')}${accentScaleAlpha
      .map((c, i) => `${getVar(['accent', 'a' + (i + 1)], c)}`)
      .join('')}${getVar(['color', 'surface', 'accent'], accentSurface)}${getVar(
      ['accent', '9', 'contrast'],
      accentContrast,
    )}${getVar(['color', 'focus'], accentScale[7])}${getVar(['color', 'selection'], accentScaleAlpha[4])}${getVar(
      ['color', 'autofill'],
      accentScaleAlpha[2],
    )}}`;
  }
  return '';
});
