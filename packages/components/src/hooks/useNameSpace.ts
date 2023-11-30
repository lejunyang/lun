// inspired by element-plus
import { EditState, withBreakpoints } from '@lun/core';
import { ComponentInternalInstance, ComputedRef, computed, getCurrentInstance } from 'vue';
import { GlobalStaticConfig, useContextConfig } from '../components/config';
import { isPreferDark } from '@lun/utils';

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

export const useNamespace = (block: string, other?: { parent?: ComponentInternalInstance | null }) => {
  const { parent } = other || {};
  const vm = getCurrentInstance();
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
    (name: string, state: boolean | undefined): string;
    (name: string): string;
  } = (name: string, ...args: [boolean | undefined] | []) => {
    const state = args.length >= 1 ? args[0]! : true;
    return name && state ? `${GlobalStaticConfig.statePrefix}${name}` : '';
  };

  // for css var
  // --el-xxx: value;
  const v = (object: Record<string, string | false | 0 | null | undefined>, addBlock = true) => {
    const styles: Record<string, string> = {};
    for (const key in object) {
      if (object[key]) {
        styles[vn(key, addBlock)] = object[key] as string;
      }
    }
    return styles;
  };

  const vn = (name: string, addBlock = true) => `--${namespace.value}${addBlock ? `-${block}` : ''}-${name}`;

  const contextConfig = useContextConfig();
  const getActualThemeValue = <T = string | undefined>(key: keyof (typeof contextConfig)['theme']) => {
    const theme = contextConfig?.theme[key];
    return (vm?.props[key] || parent?.props[key] || (theme as any)?.[block] || (theme as any)?.common || theme) as T;
  };
  const themeClass = computed(() => {
    const variant = getActualThemeValue('variant');
    const size = getActualThemeValue('size');
    const highContrast = getActualThemeValue<boolean>('highContrast');
    const appearance = getActualThemeValue('appearance');
    return [
      b(),
      variant && m(`variant-${variant}`),
      withBreakpoints(size || '1', m('size')),
      is('high-contrast', highContrast),
      is('dark', appearance === 'dark' || isPreferDark()),
    ];
  });

  const p = (part: string) => `${block ? block + '-' : ''}${part}`;

  const stateClass = (editComputed: ComputedRef<EditState>) => {
    const { disabled, readonly, loading } = editComputed.value;
    return [...themeClass.value, is('disabled', disabled), is('readonly', readonly), is('loading', loading)];
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
    // css
    /** css var */
    v,
    /** css var name */
    vn,
    /** withBreakpoints */
    bp: (...args: Parameters<typeof withBreakpoints>) => {
      return withBreakpoints(args[0] || '1', args[1] || m('size'), args[2]);
    },
    /** context config */
    config: contextConfig,
    vm,
    /** get theme class */
    get t() {
      return themeClass.value;
    },
    /** used to generate html part value */
    p,
    /** get editState class from editComputed, also return themeClass */
    s: stateClass,
  };
};

export type UseNamespaceReturn = ReturnType<typeof useNamespace>;
