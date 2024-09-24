import { ComponentKey, components, OpenShadowComponentKey, openShadowComponents } from './config.static';

export function reduceFromComps<T>(getter: () => T): Record<ComponentKey, T>;

export function reduceFromComps<T>(getter: () => T, allComp: true): Record<ComponentKey, T>;

export function reduceFromComps<T>(
  getter: () => T,
  allComp: true,
  includeCommon: true,
): Record<ComponentKey | 'common', T>;

export function reduceFromComps<T>(getter: () => T, allComp: false): Record<'common' | OpenShadowComponentKey, T>;

export function reduceFromComps<T>(
  getter: () => T,
  allComp: false,
  includeCommon: false,
): Record<OpenShadowComponentKey, T>;

export function reduceFromComps<T>(getter: () => T, allComp = true, includeCommon?: boolean) {
  const res = (allComp ? components : openShadowComponents).reduce((result, name) => {
    result[name] = getter();
    return result;
  }, {} as any);
  if (includeCommon || (includeCommon !== false && !allComp)) res.common = getter();
  return Object.seal(res);
}
