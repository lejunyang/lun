import { isFunction, isObject } from '@lun-web/utils';
import { GlobalContextConfig } from '../components/config';
import { reactive } from 'vue';
import { warn } from 'utils';

export const locales = reactive<Record<string, Record<string, string | ((param?: Record<string, any>) => string)>>>({
  'zh-CN': {
    'validation.number.type': '必须为数字',
    'validation.required': ({ label } = {}) => `请填写${label || '此字段'}`,
    'validation.number.min': '不得小于${min}',
    'validation.number.max': '不得大于${max}',
    'validation.number.greaterThan': '不得小于等于${greaterThan}',
    'validation.number.lessThan': '不得大于等于${lessThan}',

    'validation.string.type': '必须为字符串',
    'validation.string.min': '长度不得小于${min}',
    'validation.string.max': '长度不得大于${max}',
    'validation.string.greaterThan': '长度不得小于等于${greaterThan}',
    'validation.string.lessThan': '长度不得大于等于${lessThan}',

    'validation.date.type': '必须为有效日期',
    'validation.date.min': '日期不得早于${min}',
    'validation.date.max': '日期不得晚于${max}',
    'validation.date.greaterThan': '日期不得早于等于${greaterThan}',
    'validation.date.lessThan': '日期不得晚于等于${lessThan}',

    'validation.pattern': '格式不正确',
    'validation.len': '长度必须为${len}',

    'date.yearFormat': 'YYYY年',
    'date.monthFormat': 'M月',
    'date.cellFormat': 'D',

    'dialog.ok': '确定',
    'dialog.cancel': '取消',

    'mentions.noContent': '暂无数据',

    'pagination.sizeLabel': ({ size } = {}) => `${size} 条/页`,

    'select.button.selectAll': '全选',
    'select.button.reverse': '反选',
    'select.button.clear': '清空',
    'select.noContent': '暂无数据',

    'tour.prev': '上一步',
    'tour.next': '下一步',
    'tour.close': '结束',
  },
  en: {},
});

export function processStringWithParams<T>(
  value: string | ((param: T) => string) | undefined,
  param: T,
): string | undefined;
export function processStringWithParams<T>(value?: string | ((param?: T) => string), param?: T): string | undefined;

export function processStringWithParams<T extends Record<string, any>>(
  value?: string | ((param?: T) => string),
  param?: T,
): string | undefined {
  return isFunction(value)
    ? value(param)
    : param && value
    ? value.replace(/\${\w+}/g, (match) => {
        const key = match.slice(2, -1);
        return param[key] || '';
      })
    : value;
}

const wrapDefault = (strGetter?: string | ((param?: Record<string, any>) => string), param?: Record<string, any>) => {
  let str: string = processStringWithParams(strGetter, param) || '';
  return Object.assign(str, {
    d(defaultStr: string | ((param?: Record<string, any>) => string)) {
      return str || processStringWithParams(defaultStr, param)!;
    },
  });
};

export const intl = (key: string, params?: Record<string, any>) => {
  const map = locales[GlobalContextConfig.lang];
  if (isObject(map)) return wrapDefault(map[key], params);
  else if (__DEV__) {
    warn(`intl: can't find locale map for lang '${GlobalContextConfig.lang}'`);
  }
  return wrapDefault();
};
