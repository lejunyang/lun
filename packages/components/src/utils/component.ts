import { ComponentKey, GlobalStaticConfig, OpenShadowComponentKey } from 'config';
import { ComponentOptions, h } from 'vue';
import { processStringStyle } from './style';
import { setDefaultsForPropOptions } from './vueUtils';
import { exportParts } from '../common/exportParts';
import { error, warn } from './console';
import { getFirstOfIterable, isElement, isString, supportCustomElement } from '@lun/utils';
import { PropString } from 'common';
import { useContextStyles } from 'hooks';

export function getElementFirstName(comp: ComponentKey) {
  return getFirstOfIterable(GlobalStaticConfig.actualNameMap[comp]);
}

export function isLunComponent(el: Element, comp: ComponentKey) {
  return GlobalStaticConfig.actualNameMap[comp]?.has(el.tagName.toLowerCase());
}

export function renderElement(comp: ComponentKey, props?: Parameters<typeof h>[1], children?: Parameters<typeof h>[2]) {
  const name = getElementFirstName(comp);
  if (!name) {
    if (__DEV__) error(`Element "${comp}" is not defined`);
    return;
  }
  return h(name, { ...props, exportparts: exportParts[comp as OpenShadowComponentKey] }, children);
}

export type ComponentDependencyDefineMap = {
  [key: string]: (name?: string, dn?: Record<string, string>) => void;
};

export function createDefineElement(
  compKey: ComponentKey,
  Component: CustomElementConstructor,
): (name?: string) => void;

export function createDefineElement<T extends ComponentDependencyDefineMap>(
  compKey: ComponentKey,
  Component: CustomElementConstructor,
  dependencies: T,
): (name?: string, dependencyNames?: Record<keyof T, string>) => void;

/*@__NO_SIDE_EFFECTS__*/
export function createDefineElement(
  compKey: ComponentKey,
  Component: CustomElementConstructor,
  dependencies?: ComponentDependencyDefineMap,
) {
  return (name?: string, dependencyNameMap?: Record<string, string>) => {
    if (!supportCustomElement) return;
    if (dependencies) {
      for (const [k, v] of Object.entries(dependencies)) {
        v(dependencyNameMap?.[k]);
      }
    }
    name ||= GlobalStaticConfig.nameMap[compKey];
    name = name.toLowerCase();
    if (!customElements.get(name)) {
      GlobalStaticConfig.actualNameMap[compKey].add(name);
      customElements.define(name, Component);
    }
  };
}

/*@__NO_SIDE_EFFECTS__*/
export function createImportStyle(compKey: OpenShadowComponentKey | 'common', style: string) {
  return () => {
    GlobalStaticConfig.styles[compKey].push(processStringStyle(style));
  };
}

export function preprocessComponentOptions(options: ComponentOptions) {
  const compKey = options.name as ComponentKey;
  if (compKey && compKey in GlobalStaticConfig.defaultProps) {
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
    });
    options.inheritAttrs ||= false;
    const noShadow = options.shadowOptions === null || options.shadowOptions?.mode === 'closed';
    options.props = setDefaultsForPropOptions(options.props, GlobalStaticConfig.defaultProps[compKey]);
    if (!noShadow) options.props.innerStyle = PropString(); // after setDefaultsForPropOptions, because original options.props is freezed by me
    const originalSetup = options.setup;
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

export function toElement(queryOrElement?: string | Element) {
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
