import { ComponentKey, GlobalStaticConfig } from 'config';
import { h } from 'vue';

export function getCompFirstName(comp: ComponentKey) {
  return GlobalStaticConfig.actualNameMap[comp]?.values().next().value;
}

export function renderComp(comp: ComponentKey, props?: Parameters<typeof h>[1], children?: Parameters<typeof h>[2]) {
  const name = getCompFirstName(comp);
  if (name) return h(name, props, children);
}

/*! #__NO_SIDE_EFFECTS__ */
export function createDefineComp(compKey: ComponentKey, Component: CustomElementConstructor) {
  return (name?: string) => {
    name ||= GlobalStaticConfig.nameMap[compKey];
    if (!customElements.get(name)) {
      GlobalStaticConfig.actualNameMap[compKey].add(name);
      customElements.define(name, Component);
    }
  };
}

export function getCommonCompOptions(compKey: ComponentKey) {
  return {
    name: GlobalStaticConfig.nameMap[compKey],
    styles: GlobalStaticConfig.computedStyles[compKey],
  };
}
