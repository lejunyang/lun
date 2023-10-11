import { ComponentKey, GlobalStaticConfig, ShadowComponentKey } from 'config';
import { ComponentOptions, h } from 'vue';
import { processStringStyle } from './style';
import { setDefaultsForPropOptions } from './vueUtils';

export function getElementFirstName(comp: ComponentKey) {
  return GlobalStaticConfig.actualNameMap[comp]?.values().next().value;
}

export function renderElement(comp: ComponentKey, props?: Parameters<typeof h>[1], children?: Parameters<typeof h>[2]) {
  const name = getElementFirstName(comp);
  if (name) return h(name, props, children);
}

/*! #__NO_SIDE_EFFECTS__ */
export function createDefineElement(compKey: ComponentKey, Component: CustomElementConstructor) {
  return (name?: string) => {
    name ||= GlobalStaticConfig.nameMap[compKey];
    if (!customElements.get(name)) {
      GlobalStaticConfig.actualNameMap[compKey].add(name);
      customElements.define(name, Component);
    }
  };
}

/*! #__NO_SIDE_EFFECTS__ */
export function createImportStyle(compKey: ShadowComponentKey, style: string) {
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
            ? GlobalStaticConfig.computedStyles[compKey as ShadowComponentKey]
            : undefined;
        },
      },
    });
    options.props = setDefaultsForPropOptions(options.props, GlobalStaticConfig.defaultProps[compKey]);
  }
}