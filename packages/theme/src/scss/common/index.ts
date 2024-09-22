import { createImportDynamicStyle, createImportStyle, getThemeValue, getHostStyle, ThemeProps } from '@lun/components';
import { toPxIfNum } from '@lun/utils';
import commonStyles from './index.scss?inline';
import { getVarName, getVarValue } from '../utils';

export const importCommonDynamicTheme = createImportDynamicStyle('common', (vm, name, context) => {
  const getTheme = (prop: keyof ThemeProps) => getThemeValue(vm, prop, context, name);
  const scale = getTheme('scale');

  const scaleVar = getVarValue(['scale']);

  const scaleStyle = scale > 0 ? getHostStyle([getVarName('scale'), scale]) : '';
  const spaces = [4, 8, 12, 16, 24, 32, 40, 48, 64],
    spaceStyle = getHostStyle(
      spaces.flatMap((s, i) => [
        [getVarName('space', i + 1), `calc(${toPxIfNum(s)} * ${scaleVar})`],
        [getVarName('space', 'hypot', i + 1), `calc(${toPxIfNum(Math.hypot(s, s))} * ${scaleVar})`],
      ]),
      ['[scale]', '[data-root]'],
    );
  // TODO add styles for root element, root element have no explicit theme props, but theme values can be set in GlobalContextConfig
  return scaleStyle + spaceStyle;
});

export const importCommonStaticTheme = createImportStyle('common', commonStyles);

export const importCommonTheme = () => {
  importCommonStaticTheme();
  importCommonDynamicTheme();
};

export * from './color';
