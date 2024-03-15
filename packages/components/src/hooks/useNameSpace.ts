// derived from element-plus
import { ComponentInternalInstance, computed, getCurrentInstance, unref } from 'vue';
import { GlobalStaticConfig, useContextConfig } from '../components/config';
import { isArray, isPreferDark, isString } from '@lun/utils';
import { ThemeProps, themeProps } from 'common';
import { useBreakpoint } from './useBreakpoint';
import { FormInputCollector } from '../components/form-item/collector';

const _bem = (namespace: string, block: string, blockSuffix: string, element: string, modifier: string) => {
  const { commonSeparator, elementSeparator, modifierSeparator } = GlobalStaticConfig;
  let cls = `${namespace}${commonSeparator}${block}`;
  if (blockSuffix) {
    cls += `${commonSeparator}${blockSuffix}`;
  }
  if (element) {
    cls += `${elementSeparator}${element}`;
  }
  if (modifier) {
    cls += `${modifierSeparator}${modifier}`;
  }
  return cls;
};

const vmParentMap = new WeakMap<ComponentInternalInstance, ComponentInternalInstance | null | undefined>();
export const getThemeValueFromInstance = (
  vm: ComponentInternalInstance | null | undefined,
  key: keyof ThemeProps,
): any => {
  const result = vm?.props[key],
    parent = vmParentMap.get(vm!);
  return result || (parent && getThemeValueFromInstance(parent, key));
};
export const getAllThemeValuesFromInstance = (vm: ComponentInternalInstance | null | undefined) => {
  return Object.keys(themeProps).reduce((result, k) => {
    const key = k as keyof ThemeProps;
    result[key] = getThemeValueFromInstance(vm, key);
    return result;
  }, {} as Record<keyof ThemeProps, any>);
};

export const useNamespace = (block: string, other?: { parent?: ComponentInternalInstance | null }) => {
  let { parent } = other || {};
  const vm = getCurrentInstance();
  const context = FormInputCollector.child(false); // form-item will be theme parent for all its children
  if (!parent && context) parent = context.parent;
  parent && vmParentMap.set(vm!, parent);
  const config = vm && useContextConfig();
  const namespace = computed(() => {
    return config?.namespace || GlobalStaticConfig.namespace;
  });
  const b = (blockSuffix = '') => _bem(namespace.value, block, blockSuffix, '', '');
  const e = (element?: string) => (element ? _bem(namespace.value, block, '', element, '') : '');
  const m = (modifier?: string) => (modifier ? _bem(namespace.value, block, '', '', modifier) : '');
  const be = (blockSuffix?: string, element?: string) =>
    blockSuffix && element ? _bem(namespace.value, block, blockSuffix, element, '') : '';
  const em = (element?: string, modifier?: string) =>
    element && modifier ? _bem(namespace.value, block, '', element, modifier) : '';
  const bm = (blockSuffix?: string, modifier?: string) =>
    blockSuffix && modifier ? _bem(namespace.value, block, blockSuffix, '', modifier) : '';
  const bem = (blockSuffix?: string, element?: string, modifier?: string) =>
    blockSuffix && element && modifier ? _bem(namespace.value, block, blockSuffix, element, modifier) : '';
  const is: {
    (name: string, state: any): string;
    (name: string): string;
    (nameMap: Record<string, any>): string;
  } = (name: string | Record<string, any>, ...args: [boolean | undefined] | []) => {
    if (isString(name)) {
      const state = args.length >= 1 ? args[0]! : true;
      return name && unref(state) ? `${GlobalStaticConfig.statePrefix}${name}` : '';
    } else {
      let cls = '';
      for (const key in name) {
        if (unref(name[key])) cls += `${GlobalStaticConfig.statePrefix}${key} `;
      }
      return cls;
    }
  };

  // for css var
  const v = (object: Record<string, string | false | number | null | undefined>, addBlock = true) => {
    const styles: Record<string, string> = {};
    for (const key in object) {
      const value = object[key];
      if (value || value === 0) {
        styles[vn(key, addBlock)] = value as string;
      }
    }
    return styles;
  };

  const vn = (name: string, addBlock = true) => `--${namespace.value}${addBlock ? `-${block}` : ''}-${name}`;

  const contextConfig = useContextConfig();
  const getActualThemeValue = <T = string | undefined>(key: keyof (typeof contextConfig)['theme']) => {
    const theme = contextConfig?.theme[key];
    return (getThemeValueFromInstance(vm, key) || (theme as any)?.[block] || (theme as any)?.common || theme) as T;
  };

  const isDark = () => {
    const appearance = getActualThemeValue('appearance');
    return appearance === 'dark' || (isPreferDark() && appearance !== 'light');
  };

  const size = useBreakpoint({
    get size() {
      return getActualThemeValue('size');
    },
  });

  const getSizeClass = () => m('size') + '-' + (size.value || 2);

  const themeClass = computed(() => {
    const variant = getActualThemeValue('variant');
    const highContrast = getActualThemeValue<boolean>('highContrast');
    return [
      b(),
      variant && m(`variant-${variant}`),
      getSizeClass(),
      is('high-contrast', highContrast),
      is('dark', isDark()),
    ];
  });

  const p = (part: string | string[]): string =>
    isArray(part) ? part.map(p).join(' ') : `${block ? block + '-' : ''}${part} ${part}`;

  const getColor = <K extends string = 'color'>(props: Record<K, AppearanceColor<any> | undefined>, key?: K) => {
    key ||= 'color' as K;
    const appearance = getActualThemeValue('appearance');
    const value = props[key];
    return isString(value) ? value : (appearance && (value as any)?.[appearance]) || (value as any)?.initial;
  };

  return {
    namespace,
    /** block */
    b,
    /** element */
    e,
    /** modifier */
    m,
    /** block and element */
    be,
    /** element and modifier */
    em,
    /** block and element */
    bm,
    /** block, element and modifier */
    bem,
    is,
    /** similar to 'is', but add prefix 'not-' when state is falsy */
    isOr(name: string, state: any) {
      return is(state ? name : `not-${name}`);
    },
    // css
    /** css var */
    v,
    /** css var name */
    vn,
    /** context config */
    config: contextConfig,
    vm,
    /** get theme class */
    get t() {
      return themeClass.value;
    },
    /** get size class */
    s: getSizeClass,
    /** used to generate html part value */
    p,
    isDark,
    /** getActualThemeValue */
    getT: getActualThemeValue,
    getColor,
  };
};

export type UseNamespaceReturn = ReturnType<typeof useNamespace>;

export type AppearanceColor<T = string> =
  | T
  | {
      initial: T;
      light: T;
      dark: T;
    };
