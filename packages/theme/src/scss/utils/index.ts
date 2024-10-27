import { GlobalStaticConfig } from '@lun-web/components';

export function getVarName(...list: (string | number)[]) {
  const { commonSeparator, namespace } = GlobalStaticConfig;
  return '--' + namespace + commonSeparator + list.join(commonSeparator);
}

export function getVarValue(list: (string | number)[], defaultVal?: string) {
  const { commonSeparator, namespace } = GlobalStaticConfig;
  return `var(--${namespace + commonSeparator + list.join(commonSeparator)}${defaultVal ? ',' + defaultVal : ''})`;
}
