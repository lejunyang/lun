import { createImportDynamicStyle, createImportStyle, getThemeValue, getHostStyle, ThemeProps } from '@lun/components';
import { toPxIfNum } from '@lun/utils';
import commonStyles from './index.scss?inline';
import { getVarName, getVarValue } from '../utils';

const scaleVar = getVarValue(['scale']);
const spaceStyle = getHostStyle(
  [4, 8, 12, 16, 24, 32, 40, 48, 64].flatMap((s, i) => [
    [getVarName('space', i + 1), `calc(${toPxIfNum(s)} * ${scaleVar})`],
    [getVarName('space', 'hypot', i + 1), `calc(${toPxIfNum(Math.hypot(s, s))} * ${scaleVar})`],
  ]),
  ['[scale]', '[data-root]'],
);

export const importCommonDynamicTheme = createImportDynamicStyle('common', (vm, name, context) => {
  const getTheme = (prop: keyof ThemeProps) => getThemeValue(vm, prop, context, name, true);
  const scale = getTheme('scale');

  const scaleStyle = scale > 0 ? getHostStyle([getVarName('scale'), scale]) : '';
  return scaleStyle;
});

export const importCommonStaticTheme = createImportStyle('common', commonStyles + spaceStyle);

export const importCommonTheme = () => {
  importCommonStaticTheme();
  importCommonDynamicTheme();
};

export * from './color';
