import {
  ComponentKey,
  componentsWithTeleport,
  GlobalContextConfig,
  GlobalStaticConfig,
  OpenShadowComponentKey,
} from 'config';
import { App, ComponentInternalInstance, ComponentOptions, getCurrentInstance, h } from 'vue';
import { processStringStyle } from './style';
import { setDefaultsForPropOptions } from './vueUtils';
import { warn } from './console';
import {
  arrayFrom,
  createElement,
  fromObject,
  getFirstOfIterable,
  isArray,
  isCSSStyleSheet,
  isElement,
  isString,
  once,
  runIfFn,
  supportCustomElement,
} from '@lun/utils';
import { PropString } from 'common';
import { vContent } from '@lun/plugins/vue';
import { useContextStyles } from '../hooks/useStyles';

export function getElementFirstName(comp: ComponentKey) {
  return getFirstOfIterable(GlobalStaticConfig.actualNameMap[comp]);
}

export function createLunElement(comp: ComponentKey) {
  const name = getElementFirstName(comp)!;
  if (__DEV__ && !comp) throw new Error(`${comp} component is not registered, please register it first.`);
  return createElement(name as any);
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
): (name?: string, dependencyNames?: Record<Exclude<keyof T, 'common'> | ExtractChainDepNames<T>, string>) => void;

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
    name ||= nameMap[compKey];
    name = name.toLowerCase();
    if (!customElements.get(name)) {
      if (dependencies) {
        const set = (dependencySet[compKey] ||= new Set());
        for (const [k, v] of Object.entries(dependencies)) {
          v(dependencyNameMap?.[k], dependencyNameMap);
          if (k === 'common') continue;
          set.add(k as ComponentKey);
          if (dependencySet[k as ComponentKey]) dependencySet[k as ComponentKey].forEach((item) => set.add(item));
        }
      }
      if (compDefaultProps) defaultProps[compKey] = compDefaultProps;
      if (parts)
        exportParts[compKey] = parts
          .map((p) => compKey + '-' + p)
          .concat(arrayFrom(dependencySet[compKey] || [], (k) => exportParts[k]))
          .filter(Boolean)
          .join(',');
      actualNameMap[compKey].add(name);
      customElements.define(name, Component);
    }
  };
}

export function createImportStyle(
  compKey: OpenShadowComponentKey | 'common',
  style: string | (() => string) | CSSStyleSheet | (() => CSSStyleSheet),
  variantName?: string,
) {
  return once(() => {
    style = runIfFn(style);
    GlobalStaticConfig.styles[compKey]?.push(isCSSStyleSheet(style) ? style : processStringStyle(style));
    if (variantName) GlobalStaticConfig.availableVariants[compKey as OpenShadowComponentKey]?.add(variantName);
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

const getComputedStyles = once(() => {
  const { styles } = GlobalStaticConfig;
  return fromObject(styles, (k, v) => [
    k,
    k === 'teleport-holder'
      ? styles.common.concat(v).concat(...(componentsWithTeleport.map((c) => styles[c]) as any))
      : styles.common.concat(v),
  ]);
});

// custom element doesn't inherit vue app's context
const warnHandler = (msg: string, _: any, trace: string) => {
  // ignore injection not found warning
  if (msg.includes('injection') && msg.includes('not found')) return;
  // vue app validates component name... but we use 'input', 'button' as component name, ignore that
  if (msg.includes('Do not use built-in or reserved')) return;
  // not sure if it needs to be ignored, it occurred since upgraded to vue 3.5
  if (msg.includes('Attempting to hydrate existing markup but container is empty. Performing full mount instead'))
    return;
  console.warn(msg, msg.includes('Extraneous non-props') || msg.includes('hydrate') ? '\n' + trace : undefined, _);
};

export function preprocessComponentOptions(options: ComponentOptions) {
  const compKey = options.name as ComponentKey;
  if (compKey && compKey in GlobalStaticConfig.defaultProps) {
    const { props, setup, shadowOptions, emits } = options;
    const propsClone = { ...props }; // clone because props is freezed
    const getEventInit = (e: string) => {
      const { eventInitMap } = GlobalStaticConfig;
      const eventInit = eventInitMap[compKey as OpenShadowComponentKey],
        { common } = eventInitMap;
      const result = isArray(common) ? { ...common[0], ...common[1]?.[e] } : common;
      return isArray(eventInit) ? { ...result, ...eventInit[0], ...eventInit[1]?.[e] } : { ...result, ...eventInit };
    };
    Object.defineProperties(options, {
      styles: {
        get: () => getComputedStyles()[compKey],
      },
      props: {
        get: once(() => setDefaultsForPropOptions(propsClone, GlobalStaticConfig.defaultProps[compKey])),
      },
      customEventInit: {
        get: once(() => fromObject(emits || {}, (k) => [k, getEventInit(k)] as const)),
      },
      ignoreAttrs: {
        get: () => {
          const { ignoreAttrsUpdate } = GlobalStaticConfig;
          return ignoreAttrsUpdate[compKey] || ignoreAttrsUpdate.common;
        },
      },
    });
    options.inheritAttrs ||= false;
    options.onConnected = (CE: HTMLElement, parent: HTMLElement) => {
      CE.toggleAttribute('data-root', !parent); // set root attr for root element
    };
    options.configureApp = (app: App) => {
      app.config.warnHandler = warnHandler;
      app.directive('content', vContent);
    };
    options.attrTransform = (key: string, value: string | null) => {
      const { attrTransform } = GlobalStaticConfig;
      if (attrTransform[compKey][key]) return attrTransform[compKey][key](value);
      else if (attrTransform.common[key]) return attrTransform.common[key](value);
      return value;
    };
    const noShadow = shadowOptions === null || shadowOptions?.mode === 'closed';
    if (!noShadow) propsClone.innerStyle = PropString();
    const originalSetup = setup;
    options.setup = (props: any, ctx: any) => {
      const vm = getCurrentInstance()!;
      const newCtx = {
        ...ctx,
        // attrs: new Proxy(ctx.attrs, {
        //   ownKeys(target) {
        //     return objectKeys(ctx.attrs).filter((k) => k !== 'class' && k !== 'style');
        //   },
        // }),
        emit: (event: string, ...args: any[]) => vm.emit(event, ...args),
      };
      const setupResult = originalSetup?.(props, newCtx);
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
