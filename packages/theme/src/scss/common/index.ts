import { createImportStyle, getThemeValueFromInstance, TGlobalContextConfig } from '@lun/components';
import { GlobalContextConfig, GlobalStaticConfig } from '@lun/components';
import { once, toPxIfNum } from '@lun/utils';
import commonStyles from './index.scss?inline';

export const importCommonDynamicTheme = once(() => {
  GlobalContextConfig.dynamicStyles.common.push((vm, name, context) => {
    const { theme, namespace } = context as TGlobalContextConfig;
    const themeScale = theme.scale as any;
    const n = namespace || GlobalStaticConfig.namespace;
    const { commonSeparator } = GlobalStaticConfig;
    const scale = getThemeValueFromInstance(vm, 'scale') || themeScale?.[name] || themeScale?.common || themeScale;

    function getVarName(...list: (string | number)[]) {
      return '--' + n + commonSeparator + list.join(commonSeparator);
    }
    const scaleVar = `var(${getVarName('scale')})`;

    const scaleStyle = scale > 0 ? `:host{${getVarName('scale')}:${scale}}` : '';
    const spaces = [4, 8, 12, 16, 24, 32, 40, 48, 64],
      spaceStyle = `:host([scale]),:host([root]){${spaces
        .map(
          (s, i) =>
            `${getVarName('space', i + 1)}:calc(${toPxIfNum(s)} * ${scaleVar});` +
            `${getVarName('space', 'hypot', i + 1)}:calc(${toPxIfNum(Math.hypot(s, s))} * ${scaleVar});`,
        )
        .join('')}}`;
    // TODO font-size line-height... radius
    return scaleStyle + spaceStyle;
  });
});

export const importCommonStaticTheme = once(createImportStyle('common', commonStyles));

export const importCommonTheme = () => {
  importCommonStaticTheme();
  importCommonDynamicTheme();
};
