import { OpenShadowComponentKey, openShadowComponents } from './config.static';

export function reduceFromComps<T>(getter: () => T, includeCommon: true): Record<'common' | OpenShadowComponentKey, T>;

export function reduceFromComps<T>(getter: () => T): Record<OpenShadowComponentKey, T>;

export function reduceFromComps<T, I>(getter: () => T, includeCommon?: I) {
  const res = openShadowComponents.reduce((result, name) => {
    result[name] = getter();
    return result;
  }, {} as any);
  if (includeCommon) res.common = getter();
  return res;
}
