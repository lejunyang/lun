import {
  createImportDynamicStyle,
  getThemeValueFromInstance,
  GlobalStaticConfig,
  grayColors,
  TGlobalContextConfig,
  themeColors,
} from '@lun/components';
import { generateRadixColors } from './custom';

export const importCustomDynamicColors = createImportDynamicStyle('common', (vm, name, context) => {
  const { namespace } = context as TGlobalContextConfig;
  const n = namespace || GlobalStaticConfig.namespace;
  const { commonSeparator } = GlobalStaticConfig;
  const getTheme = (prop: string) => {
    const contextTheme = context[prop] as any;
    return getThemeValueFromInstance(vm, prop) || contextTheme?.[name] || contextTheme?.common || contextTheme;
  };
  const color = getTheme('color');
  function getVarName(...list: (string | number)[]) {
    return '--' + n + commonSeparator + list.join(commonSeparator);
  }
  if (color && !themeColors.includes(color) && !grayColors.includes(color)) {
    const appearance = getTheme('appearance');
    const { accentScale, accentScaleAlpha } = generateRadixColors({
      appearance,
      accent: color,
      background: appearance === 'dark' ? '#111111' : '#FFFFFF',
      gray: '#8B8D98',
    });
    return `:host{${accentScale.map((c, i) => `${getVarName('accent', i + 1)}:${c};`).join('')}${accentScaleAlpha
      .map((c, i) => `${getVarName('accent', 'a' + (i + 1))}:${c};`)
      .join('')}}`;
  }
  return '';
});
