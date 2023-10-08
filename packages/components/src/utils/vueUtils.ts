import { cacheStringFunction } from '@lun/utils';
import { ComponentObjectPropsOptions, ExtractPropTypes } from 'vue';

const hyphenateRE = /\B([A-Z])/g;
export const hyphenate = cacheStringFunction((str: string) => str.replace(hyphenateRE, '-$1').toLowerCase());

type NativeType = null | number | string | boolean | symbol | Function;
type InferDefault<P, T> = ((props: P) => T & {}) | (T extends NativeType ? T : never);
type InferDefaults<T> = {
  [K in keyof T]?: InferDefault<T, T[K]>;
};
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * used to set default value for vue object prop option
 */
export function setDefaultsForPropOptions<
  PO extends ComponentObjectPropsOptions,
  T extends Prettify<Readonly<ExtractPropTypes<PO>>>,
  Defaults extends InferDefaults<T>
>(
  props: PO,
  defaults: Defaults
): Omit<PO, keyof Defaults> & { [k in keyof Defaults]: k extends keyof PO ? PO[k] & { default: Defaults[k] } : never } {
  const result: any = { ...props };
  Object.entries(defaults).forEach(([k, v]) => {
    if (k in result && v !== undefined) {
      const propOption = result[k];
      if (propOption instanceof Function) {
        // type constructor prop option
        result[k] = { type: propOption, default: v };
      } else if (typeof propOption === 'object') {
        result[k] = { ...propOption, default: v };
      }
    }
  });
  return result;
}
