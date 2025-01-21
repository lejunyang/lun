import {
  ComponentKey,
  componentsWithTeleport,
  EventNameStyle,
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
  cacheFunctionByKey,
  capitalize,
  createElement,
  ensureArray,
  fromObject,
  getFirstOfIterable,
  hyphenate,
  identity,
  isArray,
  isCSSStyleSheet,
  isElement,
  isString,
  objectKeys,
  once,
  runIfFn,
  supportCustomElement,
} from '@lun-web/utils';
import { openShadowCommonProps } from 'common';
import { vContent } from '@lun-web/plugins/vue';
import { useContextStyles } from '../hooks/useStyles';
import { holderName } from '../components/config/utils';

export function getElementFirstName(comp: ComponentKey) {
  return getFirstOfIterable(GlobalStaticConfig.actualNameMap[comp]);
}

export function createLunElement(comp: ComponentKey) {
  const name = getElementFirstName(comp)!;
  if (__DEV__ && !comp) throw new Error(`${comp} component is not registered, please register it first.`);
  return createElement(name as any);
}

export function isLunElement(el: any, comp: ComponentKey) {
  return isElement(el) && GlobalStaticConfig.actualNameMap[comp]?.has(el.tagName.toLowerCase());
}

const exportParts = {} as Record<ComponentKey, string>;
/** record the dependencies of each component */
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

type DefineFn = (name?: string, dn?: Record<string, string>) => void;
type ExtractChain<T extends DefineFn> = T extends (name?: string, dn?: infer ChainT) => void
  ? ChainT extends Record<string, string>
    ? keyof ChainT
    : never
  : never;
type ExtractDepName<T> =
  | (T extends DefineFn ? ExtractChain<T> : never)
  | (T extends { n: infer K } ? (K extends string ? K : never) : never);

export function createDefineElement<
  CompKey extends ComponentKey,
  Comp extends CustomElementConstructor,
  Keys extends keyof InstanceType<Comp> = keyof InstanceType<Comp>,
>(
  compKey: CompKey,
  Component: Comp,
  defaultProps?: {
    [k in Keys]?: InstanceType<Comp>[k];
  },
  parts?: readonly string[] | string[],
): ((name?: string) => void) & { n: CompKey };

export function createDefineElement<
  CompKey extends ComponentKey,
  T extends ((DefineFn & { n: ComponentKey }) | (() => void))[],
  Comp extends CustomElementConstructor,
  Keys extends keyof InstanceType<Comp> = keyof InstanceType<Comp>,
>(
  compKey: CompKey,
  Component: Comp,
  defaultProps: {
    [k in Keys]?: InstanceType<Comp>[k];
  },
  parts: readonly string[] | string[],
  dependencies: T,
): ((name?: string, dependencyNames?: Partial<Record<ExtractDepName<T[number]>, string>>) => void) & {
  /** @internal represents the component name */
  n: CompKey;
};

/*@__NO_SIDE_EFFECTS__*/
export function createDefineElement(
  compKey: ComponentKey,
  Component: CustomElementConstructor,
  compDefaultProps?: Record<string, any>,
  parts?: string[] | readonly string[],
  dependencies?: Function[],
) {
  return Object.assign(
    (name?: string, dependencyNameMap?: Record<string, string>) => {
      if (!supportCustomElement) return;
      const { defaultProps, actualNameMap, namespace } = GlobalStaticConfig;
      name ||= namespace + '-' + compKey;
      name = name.toLowerCase();
      if (!supportCustomElement.get(name)) {
        if (dependencies) {
          const set = (dependencySet[compKey] ||= new Set());
          for (const fn of dependencies) {
            const fnName = (fn as any).n as ComponentKey;
            fn(dependencyNameMap?.[fnName], dependencyNameMap);
            if (fnName) set.add(fnName);
            // add nested dependencies for current
            if (dependencySet[fnName]) dependencySet[fnName].forEach((item) => set.add(item));
          }
        }
        if (compDefaultProps) {
          // respect defaultProps that are already existed
          defaultProps[compKey] = Object.assign(compDefaultProps, defaultProps[compKey]);
        }
        if (parts)
          exportParts[compKey] = parts
            .map((p) => compKey + '-' + p)
            .concat(arrayFrom(dependencySet[compKey] || [], (k) => exportParts[k]))
            .filter(Boolean)
            .join(',');
        actualNameMap[compKey].add(name);
        supportCustomElement.define(name, Component);
      }
    },
    {
      n: compKey,
    },
  );
}

/*@__NO_SIDE_EFFECTS__*/
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

/*@__NO_SIDE_EFFECTS__*/
export function createImportDynamicStyle(
  compKey: OpenShadowComponentKey | 'common',
  style:
    | string
    | ((vm: ComponentInternalInstance, compName: OpenShadowComponentKey, context: any) => string | undefined),
) {
  return once(() => GlobalContextConfig.dynamicStyles[compKey].push(style));
}

const getComputedStyles = cacheFunctionByKey((k: string) => {
  const {
      styles,
      styles: { common },
    } = GlobalStaticConfig,
    v = styles[k as OpenShadowComponentKey];
  if (!v) return;
  return k === holderName
    ? common.concat(v).concat(...(componentsWithTeleport.map((c) => styles[c]) as any))
    : common.concat(v);
});

// custom element doesn't inherit vue app's context
const warnHandler = (msg: string, _: any, trace: string) => {
  // ignore injection not found warning
  if (msg.includes('injection') && msg.includes('not found')) return;
  // vue app validates component name... but we use 'input', 'button' as component name, ignore that
  if (msg.includes('Do not use built-in or reserved')) return;
  // not sure if it needs to be ignored, it occurred since upgraded to vue 3.5
  if (msg.includes('Performing full mount instead')) return;
  console.warn(msg, msg.includes('Extraneous non-props') || msg.includes('hydrate') ? '\n' + trace : undefined, _);
};

/** elements that are not under any other lun's custom elements */
export const rootSet = new WeakSet();

const eventNameProcessMap = {
  kebab: (event) => hyphenate(event),
  camel: identity,
  lower: (event) => event.toLowerCase(),
  upper: (event) => event.toUpperCase(),
  pascal: (event) => capitalize(event),
} as Record<EventNameStyle, (name: string) => string>;

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
    const ignoreAttrs = (key: string, ce: any) => {
      return GlobalStaticConfig.ignoreAttrsUpdate(compKey, key, ce);
    };
    Object.defineProperties(options, {
      styles: {
        get: () => getComputedStyles(compKey as OpenShadowComponentKey),
      },
      props: {
        get: once(() => setDefaultsForPropOptions(propsClone, GlobalStaticConfig.defaultProps[compKey])),
      },
      customEventInit: {
        get: once(() => fromObject(emits || {}, (k) => [k, getEventInit(k)] as const)),
      },
      ignoreAttrs: {
        get: () => ignoreAttrs,
      },
      handleEventName: {
        get: once(() => {
          const { eventNameStyle } = GlobalStaticConfig;
          const map = {} as Record<string, string[]>;
          const e = options.emits,
            emits = (e ? (isArray(e) ? e : objectKeys(e)) : []) as string[];
          emits.forEach((e) => {
            const set = new Set<string>();
            ensureArray(eventNameStyle).forEach((style) => {
              const handle = eventNameProcessMap[style];
              handle && set.add(handle(e));
            });
            map[e] = arrayFrom(set);
          });
          return (eventName: string) => map[eventName] || eventName;
        }),
      },
    });
    options.inheritAttrs ||= false;
    options.onConnected = (CE: HTMLElement, parent: HTMLElement) => {
      rootSet[parent ? 'delete' : 'add'](CE);
      CE.toggleAttribute('data-root', !parent); // set root attr for root element
    };
    options.configureApp = (app: App) => {
      if (__DEV__) app.config.warnHandler = warnHandler;
      app.directive('content', vContent);
    };
    options.attrTransform = (key: string, value: string | null) => {
      const { attrTransform } = GlobalStaticConfig;
      if (attrTransform[compKey][key]) return attrTransform[compKey][key](value);
      else if (attrTransform.common[key]) return attrTransform.common[key](value);
      return value;
    };
    const noShadow = shadowOptions === null || shadowOptions?.mode === 'closed';
    if (!noShadow) Object.assign(propsClone, openShadowCommonProps);
    const originalSetup = setup;
    options.setup = (props: any, ctx: any) => {
      const vm = getCurrentInstance()!;
      const newCtx: any = {
        get attrs() {
          return ctx.attrs;
        },
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

export function toElement(queryOrElement?: string | Element | null, queryParent: Element | Document = document) {
  return isElement(queryOrElement)
    ? queryOrElement
    : isString(queryOrElement)
    ? queryParent.querySelector(queryOrElement)
    : null;
}

export function getFirstThemeProvider() {
  const { actualNameMap } = GlobalStaticConfig;
  for (const name of actualNameMap['theme-provider']) {
    const results = document.getElementsByTagName(name);
    if (results.length) return results[0];
  }
}
