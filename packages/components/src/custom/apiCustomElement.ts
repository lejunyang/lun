import {
  ComponentOptionsMixin,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithObjectProps,
  ComponentOptionsWithoutProps,
  ComponentPropsOptions,
  ComponentPublicInstance,
  ComputedOptions,
  EmitsOptions,
  MethodOptions,
  RenderFunction,
  SetupContext,
  ComponentInternalInstance,
  VNode,
  RootHydrateFunction,
  ExtractPropTypes,
  createVNode,
  defineComponent,
  nextTick,
  warn,
  ConcreteComponent,
  ComponentOptions,
  ComponentInjectOptions,
  SlotsType,
  hydrate,
  render,
  camelize,
  VueElementConstructor,
} from 'vue';
import { preprocessComponentOptions } from '../utils';
import { hyphenate, toNumberIfValid, isFunction, isCSSStyleSheet, copyCSSStyleSheetsIfNeed } from '@lun/utils';
import { virtualParentMap } from './virtualParent';

export type ExtractCEPropTypes<T> = T extends VueElementConstructor<ExtractPropTypes<infer P>> ? P : never;
type EventInit = {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
};
export type EventInitMap = Record<string, EventInit>;
export type PropUpdateCallback = (key: string, value: any, el: HTMLElement) => void | false;
export type CECallback = (instance: ComponentInternalInstance, el: VueElement, parent?: VueElement) => void;
export type Style = string | CSSStyleSheet;

// defineCustomElement provides the same type inference as defineComponent
// so most of the following overloads should be kept in sync w/ defineComponent.

// overload 1: direct setup function
export function defineCustomElement<Props, RawBindings = object>(
  setup: (props: Readonly<Props>, ctx: SetupContext) => RawBindings | RenderFunction,
): VueElementConstructor<Props>;

// overload 2: object format with no props
export function defineCustomElement<
  Props = {},
  RawBindings = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = EmitsOptions,
  EE extends string = string,
  I extends ComponentInjectOptions = {},
  II extends string = string,
  S extends SlotsType = {},
>(
  options: ComponentOptionsWithoutProps<Props, RawBindings, D, C, M, Mixin, Extends, E, EE, I, II, S> & {
    styles?: Style[];
    shadowOptions?: Partial<ShadowRootInit> | null;
    formAssociated?: boolean;
    customEventInit?: EventInitMap;
    onPropUpdate?: PropUpdateCallback;
    onCE?: CECallback;
  },
): VueElementConstructor<Props>;

// overload 3: object format with array props declaration
export function defineCustomElement<
  PropNames extends string,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = Record<string, any>,
  EE extends string = string,
  I extends ComponentInjectOptions = {},
  II extends string = string,
  S extends SlotsType = {},
>(
  options: ComponentOptionsWithArrayProps<PropNames, RawBindings, D, C, M, Mixin, Extends, E, EE, I, II, S> & {
    styles?: Style[];
    shadowOptions?: Partial<ShadowRootInit> | null;
    formAssociated?: boolean;
    customEventInit?: EventInitMap;
    onPropUpdate?: PropUpdateCallback;
    onCE?: CECallback;
  },
): VueElementConstructor<{ [K in PropNames]: any }>;

// overload 4: object format with object props declaration
export function defineCustomElement<
  PropsOptions extends Readonly<ComponentPropsOptions>,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = Record<string, any>,
  EE extends string = string,
  I extends ComponentInjectOptions = {},
  II extends string = string,
  S extends SlotsType = {},
>(
  options: ComponentOptionsWithObjectProps<PropsOptions, RawBindings, D, C, M, Mixin, Extends, E, EE, I, II, S> & {
    styles?: Style[];
    shadowOptions?: Partial<ShadowRootInit> | null;
    formAssociated?: boolean;
    customEventInit?: EventInitMap;
    onPropUpdate?: PropUpdateCallback;
    onCE?: CECallback;
  },
): VueElementConstructor<ExtractPropTypes<PropsOptions>>;

// overload 5: defining a custom element from the returned value of
// `defineComponent`
export function defineCustomElement(options: { new (...args: any[]): ComponentPublicInstance }): VueElementConstructor;

export function defineCustomElement(options: any, hydrate?: RootHydrateFunction): VueElementConstructor {
  // extra process for options
  preprocessComponentOptions(options);
  const Comp = defineComponent(options) as any;
  class VueCustomElement extends VueElement {
    static def = Comp;
    static formAssociated = !!Comp.formAssociated; // must set true if want to access _internals.form
    _internals?: ElementInternals;
    constructor(initialProps?: Record<string, any>) {
      super(Comp, initialProps, hydrate);
      if (this.attachInternals) this._internals = this.attachInternals();
    }
  }

  return VueCustomElement as any;
}

export const defineSSRCustomElement = ((options: any) => {
  // @ts-ignore
  return defineCustomElement(options, hydrate);
}) as typeof defineCustomElement;

const BaseClass = (typeof HTMLElement !== 'undefined' ? HTMLElement : class {}) as typeof HTMLElement;

type InnerComponentDef = ConcreteComponent & {
  styles?: Style[];
  shadowOptions?: Partial<ShadowRootInit> | null;
  formAssociated?: boolean;
  customEventInit?: EventInitMap;
  onPropUpdate?: PropUpdateCallback;
  onCE?: CECallback;
};

declare module 'vue' {
  interface ComponentInternalInstance {
    /**
     * used to access custom element when setup
     * @internal
     * @private
     */
    CE: VueElement;
    /**
     * resolved emits options
     * @internal
     */
    emitsOptions: import('vue').ObjectEmitsOptions | null; // must use import, "import { ObjectEmitsOptions } from 'vue'" is not included in dts build result
    /**
     * is custom element?
     * @internal
     */
    isCE?: boolean;
    /**
     * custom element specific HMR method
     * @internal
     */
    ceReload?: (newStyles?: string[]) => void;
    /**
     * Object containing values this component provides for its descendants
     * @internal
     */
    provides: Record<string | symbol, unknown>;
  }
  interface VNode {
    /**
     * @internal custom element interception hook
     */
    ce?: (instance: ComponentInternalInstance) => void;
  }
}

// custom element doesn't inherit vue app's context
const warnHandler = (msg: string, _: any, trace: string) => {
  // ignore injection not found warning
  if (msg.includes('injection') && msg.includes('not found')) return;
  console.warn(msg, msg.includes('Extraneous non-props') ? '\n' + trace : undefined);
};

const rootAttrName = 'data-root';
const shadowRootMap = new WeakMap<HTMLElement, ShadowRoot>();

export class VueElement extends BaseClass {
  /**
   * @internal
   */
  _instance: ComponentInternalInstance | null = null;

  private _connected = false;
  private _resolved = false;
  private _numberProps: Record<string, true> | null = null;
  private _styles?: HTMLStyleElement[];
  private _ob?: MutationObserver | null = null;

  constructor(
    private _def: InnerComponentDef,
    private _props: Record<string, any> = {},
    hydrate?: RootHydrateFunction,
  ) {
    super();
    Object.freeze(_def);
    if (_def.shadowOptions === null) {
      if (__DEV__ && _def.styles) {
        warn(`'styles' option in defineCustomElement will be ignored when shadowOptions is null`);
      }
    }
    if (this.shadowRoot && hydrate) {
      hydrate(this._createVNode(), this.shadowRoot);
    } else {
      if (__DEV__ && this.shadowRoot) {
        warn(
          `Custom element has pre-rendered declarative shadow root but is not ` +
            `defined as hydratable. Use \`defineSSRCustomElement\`.`,
        );
      }
      if (_def.shadowOptions !== null)
        shadowRootMap.set(this, this.attachShadow({ mode: 'open', ..._def.shadowOptions }));
      if (!(this._def as ComponentOptions).__asyncLoader) {
        // for sync component defs we can immediately resolve props
        this._resolveProps(this._def);
      }
    }
  }

  connectedCallback() {
    this._connected = true;
    if (!this._instance) {
      if (this._resolved) {
        this._update();
      } else {
        this._resolveDef();
      }
    }
  }

  disconnectedCallback() {
    this._connected = false;
    nextTick(() => {
      if (!this._connected) {
        // dom is removed
        if (this._ob) {
          this._ob.disconnect();
          this._ob = null;
        }
        render(null, this._def.shadowOptions === null ? this : shadowRootMap.get(this)!);
        this._instance = null;
      } else {
        // dom is moved to another place
        const parent = this._findParent();
        this.toggleAttribute(rootAttrName, !parent);
      }
    });
  }

  /**
   * resolve inner component definition (handle possible async component)
   */
  private _resolveDef() {
    this._resolved = true;

    // set initial attrs
    for (let i = 0; i < this.attributes.length; i++) {
      this._setAttr(this.attributes[i].name);
    }

    // watch future attr changes
    this._ob = new MutationObserver((mutations) => {
      for (const m of mutations) {
        this._setAttr(m.attributeName!);
      }
    });

    this._ob.observe(this, { attributes: true });

    const resolve = (def: InnerComponentDef, isAsync = false) => {
      const { props, styles } = def;

      // cast Number-type props set before resolve
      let numberProps;
      if (props && !Array.isArray(props)) {
        for (const key in props) {
          const opt = props[key];
          if (opt === Number || (opt && opt.type === Number) || opt?.type?.[0] === Number) {
            if (key in this._props) {
              this._props[key] = toNumberIfValid(this._props[key]);
            }
            (numberProps || (numberProps = Object.create(null)))[camelize(key)] = true;
          }
        }
      }
      this._numberProps = numberProps;

      if (isAsync) {
        // defining getter/setters on prototype
        // for sync defs, this already happened in the constructor
        this._resolveProps(def);
      }

      // apply CSS
      this._applyStyles(styles);

      // initial render
      this._update();
    };

    const asyncDef = (this._def as ComponentOptions).__asyncLoader;
    if (asyncDef) {
      asyncDef().then((def: ConcreteComponent) => resolve(def, true));
    } else {
      resolve(this._def);
    }
  }

  private _resolveProps(def: InnerComponentDef) {
    const { props } = def;
    const declaredPropKeys = Array.isArray(props) ? props : Object.keys(props || {});

    // check if there are props set pre-upgrade or connect
    for (const key of Object.keys(this)) {
      if (key[0] !== '_' && declaredPropKeys.includes(key)) {
        this._setProp(key, this[key as keyof this], true, false);
      }
    }

    // defining getter/setters on prototype
    for (const key of declaredPropKeys.map(camelize)) {
      Object.defineProperty(this, key, {
        get() {
          return this._getProp(key);
        },
        set(val) {
          this._setProp(key, val);
        },
      });
    }
  }

  protected _setAttr(key: string) {
    // ignore data- and aria- attrs
    if (key.startsWith('data-') || key.startsWith('aria-')) return;
    let value: any = this.hasAttribute(key) ? this.getAttribute(key) : undefined;
    const camelKey = camelize(key);
    if (this._numberProps && this._numberProps[camelKey]) {
      value = toNumberIfValid(value);
    }
    this._setProp(camelKey, value, false);
  }

  /**
   * @internal
   */
  protected _getProp(key: string) {
    return this._props[key];
  }

  /**
   * @internal
   */
  protected _setProp(key: string, val: any, shouldReflect = true, shouldUpdate = true) {
    if (val !== this._props[key]) {
      this._props[key] = val;
      if (isFunction(this._def.onPropUpdate)) {
        if (this._def.onPropUpdate(key, val, this) === false) return;
      }
      if (shouldUpdate && this._instance) {
        this._update();
      }
      // reflect
      if (shouldReflect) {
        if (val === true) {
          this.setAttribute(hyphenate(key), '');
        } else if (typeof val === 'string' || typeof val === 'number') {
          this.setAttribute(hyphenate(key), val + '');
        } else if (!val) {
          this.removeAttribute(hyphenate(key));
        }
      }
    }
  }

  private _update() {
    render(this._createVNode(), this._def.shadowOptions === null ? this : shadowRootMap.get(this)!);
  }

  private _findParent() {
    // locate nearest Vue custom element parent for provide/inject
    let parent: Node | null = this;
    // parentNode of shadowRoot is null, use host to get parentNode
    while ((parent = parent && (parent.parentNode || (parent as ShadowRoot).host))) {
      const virtual = virtualParentMap.get(parent) as VueElement;
      if (virtual) parent = virtual;
      if (parent instanceof VueElement) return parent;
    }
  }

  private _createVNode(): VNode<any, any> {
    const vnode = createVNode(this._def, Object.assign({}, this._props));
    if (!this._instance) {
      vnode.ce = (instance) => {
        this._instance = instance;
        instance.CE = this;
        instance.isCE = true;
        // HMR
        if (__DEV__) {
          instance.appContext.config.warnHandler = warnHandler;
          instance.ceReload = (newStyles) => {
            // always reset styles
            if (this._styles) {
              this._styles.forEach((s) => this.shadowRoot!.removeChild(s));
              this._styles.length = 0;
            }
            this._applyStyles(newStyles);
            this._instance = null;
            this._update();
          };
        }

        const dispatch = (event: string, ...args: any[]) => {
          this.dispatchEvent(
            new CustomEvent(event, {
              ...this._def.customEventInit?.[event],
              detail: args.length === 1 ? args[0] : args, // if there is only one argument, take it out
            }),
          );
        };

        // intercept emit
        instance.emit = (event: string, ...args: any[]) => {
          // dispatch both the raw and hyphenated versions of an event
          // to match Vue behavior
          dispatch(event, ...args);
          if (hyphenate(event) !== event) {
            dispatch(hyphenate(event), ...args);
          }
        };

        let parent = this._findParent();
        if (parent) {
          instance.parent = parent._instance;
          instance.provides = parent._instance!.provides;
        } else this.setAttribute(rootAttrName, '');
        if (isFunction(this._def.onCE)) this._def.onCE(instance, this, parent);
      };
    }
    return vnode;
  }

  private _applyStyles(styles: (string | CSSStyleSheet)[] | undefined) {
    if (styles && this.shadowRoot) {
      const sheets: CSSStyleSheet[] = [];
      styles.forEach((css) => {
        if (isCSSStyleSheet(css)) {
          sheets.push(css);
          return;
        }
        const s = document.createElement('style');
        s.textContent = css as string;
        this.shadowRoot!.appendChild(s);
        // record for HMR
        if (__DEV__) {
          (this._styles || (this._styles = [])).push(s);
        }
      });
      if (sheets.length)
        // copyCSSStyleSheetsIfNeed is for doc-pip component. when custom-element is moved to another document, it will throw an error: Sharing constructed stylesheets in multiple documents is not allowed
        // so we must check if the stylesheets are shared between documents, if so, we must clone them
        this.shadowRoot.adoptedStyleSheets = copyCSSStyleSheetsIfNeed(sheets, this);
    }
  }
}
