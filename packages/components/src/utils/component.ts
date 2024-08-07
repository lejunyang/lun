import { ComponentKey, GlobalContextConfig, GlobalStaticConfig, OpenShadowComponentKey } from 'config';
import { ComponentInternalInstance, ComponentOptions, h } from 'vue';
import { processStringStyle } from './style';
import { setDefaultsForPropOptions } from './vueUtils';
import { warn } from './console';
import { getFirstOfIterable, isElement, isString, once, supportCustomElement } from '@lun/utils';
import { PropString } from 'common';
import { useContextStyles } from '../hooks/useStyles';

export function getElementFirstName(comp: ComponentKey) {
  return getFirstOfIterable(GlobalStaticConfig.actualNameMap[comp]);
}

export function isLunComponent(el: any, comp: ComponentKey) {
  return isElement(el) && GlobalStaticConfig.actualNameMap[comp]?.has(el.tagName.toLowerCase());
}

const exportParts = {} as Record<ComponentKey, string>;
const dependencySet = {} as Record<ComponentKey, Set<ComponentKey>>;
export function renderElement(comp: ComponentKey, props?: Parameters<typeof h>[1], children?: Parameters<typeof h>[2]) {
  const name = getElementFirstName(comp);
  if (!name) {
    if (__DEV__) warn(`Component "${comp}" is not defined`);
    return;
  }
  return h(
    name,
    {
      ...props,
      exportparts: exportParts[comp as OpenShadowComponentKey],
    },
    children,
  );
}

export type ComponentDependencyDefineMap = {
  [key: string]: (name?: string, dn?: Record<string, string>) => void;
};
type ExtractChainDepNames<T extends ComponentDependencyDefineMap> = T[keyof T] extends (
  name?: string,
  dn?: infer ChainT,
) => void
  ? ChainT extends Record<string, string>
    ? keyof ChainT
    : never
  : never;

export function createDefineElement<
  Comp extends CustomElementConstructor,
  Keys extends keyof InstanceType<Comp> = keyof InstanceType<Comp>,
>(
  compKey: ComponentKey,
  Component: Comp,
  defaultProps?: {
    [k in Keys]?: InstanceType<Comp>[k];
  },
  parts?: readonly string[] | string[],
): (name?: string) => void;

export function createDefineElement<
  T extends ComponentDependencyDefineMap,
  Comp extends CustomElementConstructor,
  Keys extends keyof InstanceType<Comp> = keyof InstanceType<Comp>,
>(
  compKey: ComponentKey,
  Component: Comp,
  defaultProps: {
    [k in Keys]?: InstanceType<Comp>[k];
  },
  parts: readonly string[] | string[],
  dependencies: T,
): (name?: string, dependencyNames?: Record<keyof T | ExtractChainDepNames<T>, string>) => void;

/*@__NO_SIDE_EFFECTS__*/
export function createDefineElement(
  compKey: ComponentKey,
  Component: CustomElementConstructor,
  compDefaultProps?: Record<string, any>,
  parts?: string[] | readonly string[],
  dependencies?: ComponentDependencyDefineMap,
) {
  return (name?: string, dependencyNameMap?: Record<string, string>) => {
    if (!supportCustomElement) return;
    const { nameMap, defaultProps, actualNameMap } = GlobalStaticConfig;
    if (dependencies) {
      const set = (dependencySet[compKey] ||= new Set());
      for (const [k, v] of Object.entries(dependencies)) {
        v(dependencyNameMap?.[k], dependencyNameMap);
        set.add(k as ComponentKey);
        if (dependencySet[k as ComponentKey]) dependencySet[k as ComponentKey].forEach((item) => set.add(item));
      }
    }
    name ||= nameMap[compKey];
    name = name.toLowerCase();
    if (!customElements.get(name)) {
      if (compDefaultProps) defaultProps[compKey] = compDefaultProps;
      if (parts)
        exportParts[compKey] = parts
          .map((p) => compKey + '-' + p)
          .concat(Array.from(dependencySet[compKey] || []).map((k) => exportParts[k]))
          .filter(Boolean)
          .join(',');
      actualNameMap[compKey].add(name);
      customElements.define(name, Component);
    }
  };
}

export function createImportStyle(compKey: OpenShadowComponentKey | 'common', style: string) {
  return once(() => {
    GlobalStaticConfig.styles[compKey].push(processStringStyle(style));
  });
}

export function createImportDynamicStyle(
  compKey: OpenShadowComponentKey | 'common',
  style:
    | string
    | ((vm: ComponentInternalInstance, compName: OpenShadowComponentKey, context: any) => string | undefined),
) {
  return once(() => GlobalContextConfig.dynamicStyles[compKey].push(style));
}

export function preprocessComponentOptions(options: ComponentOptions) {
  const compKey = options.name as ComponentKey;
  if (compKey && compKey in GlobalStaticConfig.defaultProps) {
    const { props, setup, shadowOptions } = options;
    const propsClone = { ...props };
    Object.defineProperties(options, {
      name: {
        get() {
          return GlobalStaticConfig.nameMap[compKey];
        },
      },
      styles: {
        get() {
          return compKey in GlobalStaticConfig.computedStyles
            ? GlobalStaticConfig.computedStyles[compKey as OpenShadowComponentKey]
            : undefined;
        },
      },
      props: {
        get: () => setDefaultsForPropOptions(propsClone, GlobalStaticConfig.defaultProps[compKey]),
      },
    });
    options.inheritAttrs ||= false;
    const noShadow = shadowOptions === null || shadowOptions?.mode === 'closed';
    if (!noShadow) propsClone.innerStyle = PropString();
    const originalSetup = setup;
    options.setup = (props: any, ctx: any) => {
      const setupResult = originalSetup?.(props, ctx);
      if (noShadow) return setupResult;
      const styleNodes = useContextStyles(compKey as OpenShadowComponentKey);
      return () => [styleNodes?.value, setupResult()];
    };
  } else if (__DEV__) {
    warn(`Component "${compKey}" is not defined in GlobalStaticConfig`, options);
  }
}

export function toElement(queryOrElement?: string | Element | null) {
  return isElement(queryOrElement)
    ? queryOrElement
    : isString(queryOrElement)
    ? document.querySelector(queryOrElement)
    : null;
}

export function getFirstThemeProvider() {
  const { actualNameMap } = GlobalStaticConfig;
  for (const name of actualNameMap['theme-provider']) {
    const results = document.getElementsByTagName(name);
    if (results.length) return results[0];
  }
}
