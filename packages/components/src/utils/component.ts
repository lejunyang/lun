import { ComponentKey, GlobalStaticConfig, ShadowComponentKey } from 'config';
import { h } from 'vue';

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

export function getCommonElementOptions(compKey: ComponentKey) {
  return {
    name: GlobalStaticConfig.nameMap[compKey],
    styles:
      compKey in GlobalStaticConfig.computedStyles
        ? GlobalStaticConfig.computedStyles[compKey as ShadowComponentKey]
        : undefined,
  };
}
