import { isFunction, isObject } from '@lun/utils';
import { GlobalStaticConfig } from '../components/config';
import { reactive } from 'vue';
import { warn } from 'utils';

export const locales = reactive<Record<string, Record<string, string | ((param?: Record<string, any>) => string)>>>({
  'zh-CN': {
    'validation.required': ({ label } = {}) => (label ? `请填写${label}` : '请填写此字段'),
    'validation.number.min': '不得小于${min}',
    'validation.number.max': '不得大于${max}',
    'validation.number.greaterThan': '不得小于等于${greaterThan}',
    'validation.number.lessThan': '不得大于等于${lessThan}',

    'select.button.selectAll': '全选',
    'select.button.reverse': '反选',
    'select.button.clear': '清空',
  },
});

const wrapDefault = (strGetter?: string | ((param?: Record<string, any>) => string), param?: Record<string, any>) => {
  let str: string = '';
  if (isFunction(strGetter)) str = strGetter(param);
  else if (strGetter) {
    str = strGetter;
    if (param) {
      str = str.replace(/\${\w+}/g, (match) => {
        const key = match.slice(2, -1);
        return param[key] || '';
      });
    }
  }
  return Object.assign(str, {
    d(defaultStr: string) {
      return str || defaultStr;
    },
  });
};

export const intl = (key: string, params?: Record<string, any>) => {
  const map = locales[GlobalStaticConfig.lang];
  if (isObject(map)) return wrapDefault(map[key], params);
  else if (__DEV__) {
    warn(`intl: can't find locale map for lang '${GlobalStaticConfig.lang}'`);
  }
  return wrapDefault();
};
