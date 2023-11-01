import { isObject } from '@lun/utils';
import { GlobalStaticConfig } from '../components/config';
import { reactive } from 'vue';
import { warn } from 'utils';

export const locales = reactive<Record<string, Record<string, string>>>({});

const wrapDefault = (str?: string | undefined | null) => {
  return Object.assign(str || '', {
    d(defaultStr: string) {
      return str || defaultStr;
    },
  });
};

export const intl = (key: string) => {
  const map = locales[GlobalStaticConfig.lang];
  if (isObject(map)) return wrapDefault(map[key]);
  else if (__DEV__) {
    warn(`intl: can't find locale map for lang '${GlobalStaticConfig.lang}'`);
  }
  return wrapDefault();
};
