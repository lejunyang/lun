import { fromObject, RemoveFirstParam, TryGet } from '@lun-web/utils';
import { FinalDateMethods, DateType } from './date';
import { createBigIntDecimalMathPreset } from './math';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../utils';

export * from './math';
export * from './date';

export interface DateInterface {
  // date: unknown;
}

export type DateValueType = TryGet<DateInterface, 'date', any>;
export type DatePanelType = 'date' | 'week' | 'month' | 'quarter' | 'year';

export const presets = Object.seal({
  /** define the methods used to process numbers, now used in number input only */
  math: createBigIntDecimalMathPreset(),
  date: null as any as FinalDateMethods<DateValueType>,
});

const createProxy = (obj: any, param: MaybeRefLikeOrGetter<any>) =>
  fromObject(obj, (k, v) => [
    k,
    v
      ? new Proxy(v, {
          apply(target, thisArg, argArray) {
            return target.apply(thisArg, [unrefOrGet(param), ...argArray]);
          },
        })
      : undefined,
  ]);

/** return proxies of the date locale methods with the language parameter bound, so that we don't have to pass it every time we call the locale method */
export const createDateLocaleMethods = (lang: MaybeRefLikeOrGetter<string, true>) => {
  return createProxy(presets.date.locale, lang) as {
    [k in keyof typeof presets.date.locale]: RemoveFirstParam<(typeof presets.date.locale)[k]>;
  };
};

/** return proxies of the date type methods with the language parameter bound, so that we don't have to pass it every time we call the type method */
export const createDateTypeMethods = (t: MaybeRefLikeOrGetter<DateType, true>) => {
  return createProxy(presets.date.type, t) as {
    [k in keyof typeof presets.date.type]: RemoveFirstParam<(typeof presets.date.type)[k]>;
  };
};

export type Presets = typeof presets;
