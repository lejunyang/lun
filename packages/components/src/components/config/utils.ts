import { freeze, fromObject, TryGet } from '@lun-web/utils';
import { ComponentInternalInstance } from 'vue';

export function reduceFromComps<T>(getter: () => T): Record<ComponentKey, T>;

export function reduceFromComps<T>(getter: () => T, allComp: true): Record<ComponentKey, T>;

export function reduceFromComps<T>(
  getter: () => T,
  allComp: true,
  includeCommon: true,
): Record<ComponentKey | 'common', T>;

export function reduceFromComps<T>(getter: () => T, allComp: false): Record<'common' | OpenShadowComponentKey, T>;

export function reduceFromComps<T>(
  getter: () => T,
  allComp: false,
  includeCommon: false,
): Record<OpenShadowComponentKey, T>;

export function reduceFromComps<T>(getter: () => T, allComp = true, includeCommon?: boolean) {
  const res = (allComp ? components : openShadowComponents).reduce((result, name) => {
    result[name] = getter();
    return result;
  }, {} as any);
  if (includeCommon || (includeCommon !== false && !allComp)) res.common = getter();
  return res;
}

export const holderName = 'teleport-holder';
export const componentsWithTeleport = freeze(['message', 'popover', 'select'] as const);
export const noShadowComponents = freeze(['custom-renderer', 'virtual-renderer'] as const);
export const closedShadowComponents = freeze(['watermark'] as const);
export const openShadowComponents = freeze([
  'accordion',
  'accordion-group',
  'button',
  'calendar',
  'callout',
  'checkbox',
  'checkbox-group',
  'color-picker',
  'date-picker',
  'dialog',
  'divider',
  'doc-pip',
  'file-picker',
  'form',
  'form-item',
  'icon',
  'input',
  'mentions',
  'message',
  'pagination',
  'popover',
  'progress',
  'radio',
  'radio-group',
  'range',
  'scroll-view',
  'select',
  'select-option',
  'select-optgroup',
  'skeleton',
  'spin',
  'switch',
  'table',
  'table-column',
  'tabs',
  'tab-item',
  'tag',
  holderName,
  'text',
  'textarea',
  'theme-provider',
  'tooltip',
  'tour',
  'tree',
  'tree-item',
] as const);
export const components = freeze([...openShadowComponents, ...noShadowComponents, ...closedShadowComponents] as const);
export interface UserComponents {
  // user defined components
  // open: 'test' | 'user-el'
}
export type OpenShadowComponentKey = (typeof openShadowComponents)[number] | TryGet<UserComponents, 'open'>;
export type ComponentKey = (typeof components)[number] | TryGet<UserComponents, 'open'>;

export type ComponentStyles = Record<'common' | OpenShadowComponentKey, (string | CSSStyleSheet)[]>;

const arr = () => [],
  set = () => new Set(),
  obj = () => ({});
export const staticConfig = {
  attrTransform: [obj, true, true] as const,
  styles: [arr, false] as const,
  actualNameMap: [set] as const,
  defaultProps: [obj] as const,
  availableVariants: [set, false, false] as const,
  eventInitMap: [obj, true, true] as const,
};

export const compStatic = fromObject(staticConfig, (k, v) => [
  k,
  // @ts-expect-error
  reduceFromComps(...v),
]) as {
  /** define transformers to transform element's attributes to props */
  attrTransform: Record<ComponentKey | 'common', Record<string, (val: string | null) => any>>;
  /** define every components' static styles having open shadow root, also can set global common style with `common` key */
  styles: ComponentStyles;
  /** a map of component's name to its all defined names set, e.g. `button` to `Set(['l-button', 'my-button'])` */
  actualNameMap: Record<ComponentKey, Set<string>>;
  /** define default props for every component */
  defaultProps: Record<ComponentKey, Record<string, unknown>>;
  /** define available variants for every component */
  availableVariants: Record<OpenShadowComponentKey, Set<string>>;
  /**
   * define every components' event init map, it's used to initialize the event object when dispatch event
   * every entry accepts object or array value:
   * - object value: `{ button: { composed: true, bubbles: true } }`, the object will be used for every event for that component
   * - array value: `{ button: [{ composed: true }, { validClick: { bubbles: true } }] }` the first value will be used for every event, the second object can be the corresponding event's init(event name must be camelCase)
   */
  eventInitMap: Record<
    ComponentKey | 'common',
    Omit<CustomEventInit, 'detail'> | [Omit<CustomEventInit, 'detail'>, Record<string, Omit<CustomEventInit, 'detail'>>]
  >;
};

export const contextConfigs = {
  dynamicStyles: [arr, false] as const,
  transitions: [obj, false, false] as const,
};

export type DynamicStyleValue =
  | ((vm: ComponentInternalInstance, compName: OpenShadowComponentKey, context: any) => string | undefined)
  | string;

export const compContext = fromObject(contextConfigs, (k, v) => [
  k,
  // @ts-expect-error
  reduceFromComps(...v),
]) as {
  /** define dynamic styles for every component having open shadow root */
  dynamicStyles: Record<OpenShadowComponentKey | 'common', DynamicStyleValue[]>;
  /** define every components' transition styles */
  transitions: Record<OpenShadowComponentKey, Record<string, string>>;
};
