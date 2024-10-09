// derived from element-plus
import { ComponentInternalInstance, computed, getCurrentInstance } from 'vue';
import { GlobalStaticConfig, useContextConfig } from '../components/config';
import { fromObject, isArray, isPreferDark, isString, objectKeys } from '@lun/utils';
import { isHighlightStatus, isStatus, Status, ThemeProps, themeProps } from 'common';
import { useBreakpoint } from './useBreakpoint';
import { FormInputCollector } from '../components/form-item/collector';
import { MaybeRefLikeOrGetter, unrefOrGetState, unrefOrGet } from '@lun/core';
import { useExpose } from 'hooks';
import { rootElements } from 'utils';

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
/** @private */
export const getThemeValue = (
  vm: ComponentInternalInstance | null | undefined,
  key: keyof ThemeProps,
  context?: any,
  compName?: string,
  ignoreParent?: boolean,
): any => {
  if (!vm) return;
  const result = vm.props[key],
    parent = vmParentMap.get(vm!);
  const theme = context?.theme?.[key];
  return (
    result ||
    (parent && !ignoreParent && getThemeValue(parent, key)) ||
    (theme &&
      ((compName && theme[compName]) ||
        // if it ignores parent and is not root element, do not use common theme
        ((!ignoreParent || rootElements.has(vm.ce!)) && (theme.common || theme))))
  );
};

/** @private */
export const getAllThemeValues = (vm: ComponentInternalInstance | null | undefined) => {
  return objectKeys(themeProps).reduce((result, k) => {
    result[k] = getThemeValue(vm, k);
    return result;
  }, {} as Record<keyof ThemeProps, any>);
};

// TODO split useNameSpace
export const useNamespace = (
  block: string,
  other?: { parent?: ComponentInternalInstance | null; status?: MaybeRefLikeOrGetter<Status> },
) => {
  let { parent, status } = other || {};
  const vm = getCurrentInstance()!;
  const context = FormInputCollector.child(false); // form-item will be theme parent for all its children
  if (!parent && context) parent = context.parent;
  parent && vmParentMap.set(vm, parent);

  const { namespace, statePrefix, colorPriority } = GlobalStaticConfig;
  const b = (blockSuffix = '') => _bem(namespace, block, blockSuffix, '', '');
  const e = (element?: string) => (element ? _bem(namespace, block, '', element, '') : '');
  const m = (modifier?: string | false) => (modifier ? _bem(namespace, block, '', '', modifier) : '');
  const be = (blockSuffix?: string, element?: string) =>
    blockSuffix && element ? _bem(namespace, block, blockSuffix, element, '') : '';
  const em = (element?: string, modifier?: string) =>
    element && modifier ? _bem(namespace, block, '', element, modifier) : '';
  const bm = (blockSuffix?: string, modifier?: string) =>
    blockSuffix && modifier ? _bem(namespace, block, blockSuffix, '', modifier) : '';
  const bem = (blockSuffix?: string, element?: string, modifier?: string) =>
    blockSuffix && element && modifier ? _bem(namespace, block, blockSuffix, element, modifier) : '';
  const is: {
    (name: string, state: any): string;
    (name: string): string;
    (nameMap: Record<string, any>): string;
  } = (name: string | Record<string, any>, ...args: any) => {
    if (isString(name)) {
      const state = args.length >= 1 ? args[0] : true;
      return name && unrefOrGetState(state) ? `${statePrefix}${name}` : '';
    } else {
      let cls = '';
      for (const key in name) {
        if (unrefOrGetState(name[key])) cls += `${statePrefix}${key} `;
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

  const vn = (name: string, addBlock = true) => `--${namespace}${addBlock ? `-${block}` : ''}-${name}`;

  const contextConfig = useContextConfig();
  const getActualThemeValue = <T = string | undefined>(key: keyof (typeof contextConfig)['theme'] | 'status') => {
    return getThemeValue(vm, key, contextConfig, block) as T;
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

  useExpose(
    {},
    {
      size: {
        get: () => size.value || 2,
      },
      isDark: {
        get: isDark,
      },
    },
  );

  const getSizeClass = () => m('size') + '-' + (size.value || 2);

  const themeClass = computed(() => {
    const variant = getActualThemeValue('variant'),
      highContrast = getActualThemeValue<boolean>('highContrast'),
      color = getActualThemeValue('color'),
      statusVal = unrefOrGet(status) || getActualThemeValue('status');
    let finalColor: any;
    switch (colorPriority) {
      case 'color-first':
        finalColor = color || (isStatus(statusVal) && statusVal);
        break;
      case 'status-first':
        finalColor = isStatus(statusVal) ? statusVal : color;
        break;
      default:
        finalColor = isHighlightStatus(statusVal) ? statusVal : color;
        break;
    }

    return [
      b(),
      variant && m(`variant-${variant}`),
      getSizeClass(),
      is('high-contrast', highContrast),
      is('dark', isDark()),
      is('highlight-status', isHighlightStatus(statusVal)),
      finalColor && _bem(namespace, 'color', '', '', finalColor),
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
      return is(unrefOrGetState(state) ? name : `not-${name}`);
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
    themes() {
      return fromObject(themeProps, (k) => [k, getActualThemeValue(k)] as const) as Record<keyof ThemeProps, any>;
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
