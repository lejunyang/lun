import {
  createImportDynamicStyle,
  getThemeValue,
  GlobalStaticConfig,
  TGlobalContextConfig,
  allColorSet,
} from '@lun/components';
import { generateRadixColors } from './custom';

export const importCustomDynamicColors = createImportDynamicStyle('common', (vm, name, context) => {
  const { namespace } = context as TGlobalContextConfig;
  const n = namespace || GlobalStaticConfig.namespace;
  const { commonSeparator } = GlobalStaticConfig;
  const getTheme = (prop: string) => getThemeValue(vm, prop, context, name);
  const color = getTheme('color');
  function getVar(list: (string | number)[], value: string) {
    return '--' + n + commonSeparator + list.join(commonSeparator) + ':' + value + ';';
  }
  if (color && !allColorSet.has(color)) {
    const appearance = getTheme('appearance');
    const { accentScale, accentScaleAlpha, accentContrast, accentSurface } = generateRadixColors({
      appearance,
      accent: color,
      background: appearance === 'dark' ? '#111111' : '#FFFFFF',
      gray: '#8B8D98',
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
