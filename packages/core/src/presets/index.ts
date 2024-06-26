import { fromObject, RemoveFirstParam, TryGet } from '@lun/utils';
import { DateMethods } from './date';
import { createBigIntDecimalMath } from './math';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../utils';

export * from './math';
export * from './date';

export interface DateInterface {
  // date: unknown;
}

export type DateValueType = TryGet<DateInterface, 'date', any>;
export type DatePanelType = 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year' | 'decade';

export const presets = Object.seal({
  /** define the methods used to process numbers, now used in number input only */
  math: createBigIntDecimalMath(),
  date: null as any as Required<DateMethods<DateValueType>>,
});

/** return proxies of the date locale methods with the language parameter bound, so that we don't have to pass it every time we call the locale method */
export const createDateLocaleMethods = (lang: MaybeRefLikeOrGetter<string, true>) => {
  const { locale } = presets.date;
  return fromObject(locale, (k, v) => [
    k,
    v
      ? new Proxy(v, {
          apply(target, thisArg, argArray) {
            // @ts-ignore
            return target.apply(thisArg, [unrefOrGet(lang), ...argArray]);
          },
        })
      : undefined,
  ]) as {
    [k in keyof typeof locale]: RemoveFirstParam<(typeof locale)[k]>;
  };
};

export type Presets = typeof presets;
