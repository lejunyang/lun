import {
  ComponentOptionsMixin,
  CreateComponentPublicInstanceWithMixins,
  ComponentPublicInstance,
  ComputedOptions,
  EmitsOptions,
  MethodOptions,
  RenderFunction,
  SetupContext,
  ComponentInternalInstance,
  VNode,
  ExtractPropTypes,
  createVNode,
  defineComponent,
  nextTick,
  warn,
  ConcreteComponent,
  ComponentOptions,
  ComponentInjectOptions,
  SlotsType,
  render,
  camelize,
  ComponentObjectPropsOptions,
  App,
  ComponentOptionsBase,
  EmitsToProps,
  ComponentProvideOptions,
  Directive,
  Component,
  DefineComponent,
  CreateAppFunction,
  createApp,
  ComponentCustomElementInterface,
  createSSRApp,
} from 'vue';
import { preprocessComponentOptions } from '../utils/component'; // don't import it from '../utils' in case of circular dependencies (utils/component import hooks, useSlots import VueCustomRenderer)
import {
  hyphenate,
  toNumberIfValid,
  isFunction,
  isCSSStyleSheet,
  copyCSSStyleSheetsIfNeed,
  freeze,
  isArray,
  objectKeys,
  createElement,
} from '@lun-web/utils';
import { virtualParentMap } from './virtualParent';

// marker for attr removal
const REMOVAL = Symbol();

export type VueElementConstructor<P = {}> = {
  new (initialProps?: Record<string, any>): VueElement & P;
};

export type EventInitMap = Record<string, EventInit>;
export type PropUpdateCallback = (key: string, value: any, el: HTMLElement) => void | false;
export type CECallback = (instance: ComponentInternalInstance, el: VueElement, parent?: VueElement) => void;
export interface CustomElementOptions {
  styles?: (string | CSSStyleSheet)[];
  shadowRoot?: boolean;
  nonce?: string;
  configureApp?: (app: App) => void;
  shadowOptions?: Partial<ShadowRootInit> | null;
  formAssociated?: boolean;
  customEventInit?: EventInitMap;
  onPropUpdate?: PropUpdateCallback;
  onCE?: CECallback;
  onConnected?: (CE: VueElement, parent?: VueElement) => void;
  ignoreAttrs?: (key: string, CE: VueElement) => boolean | void;
  attrTransform?: (key: string, val: string | null, CE: VueElement) => any;
}

export type ExtractCEPropTypes<T> = T extends VueElementConstructor<ExtractPropTypes<infer P>> ? P : never;
type EventInit = {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
};

// defineCustomElement provides the same type inference as defineComponent
// so most of the following overloads should be kept in sync w/ defineComponent.

// overload 1: direct setup function
export function defineCustomElement<Props, RawBindings = object>(
  setup: (props: Props, ctx: SetupContext) => RawBindings | RenderFunction,
  options?: Pick<ComponentOptions, 'name' | 'inheritAttrs' | 'emits'> &
    CustomElementOptions & {
      props?: (keyof Props)[];
    },
): VueElementConstructor<Props>;
export function defineCustomElement<Props, RawBindings = object>(
  setup: (props: Props, ctx: SetupContext) => RawBindings | RenderFunction,
  options?: Pick<ComponentOptions, 'name' | 'inheritAttrs' | 'emits'> &
    CustomElementOptions & {
      props?: ComponentObjectPropsOptions<Props>;
    },
): VueElementConstructor<Props>;

// overload 2: defineCustomElement with options object, infer props from options
export function defineCustomElement<
  // props
  RuntimePropsOptions extends ComponentObjectPropsOptions = ComponentObjectPropsOptions,
  PropsKeys extends string = string,
  // emits
  RuntimeEmitsOptions extends EmitsOptions = {},
  EmitsKeys extends string = string,
  // other options
  Data = {},
  SetupBindings = {},
  Computed extends ComputedOptions = {},
  Methods extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  InjectOptions extends ComponentInjectOptions = {},
  InjectKeys extends string = string,
  Slots extends SlotsType = {},
  LocalComponents extends Record<string, Component> = {},
  Directives extends Record<string, Directive> = {},
  Exposed extends string = string,
  Provide extends ComponentProvideOptions = ComponentProvideOptions,
  // resolved types
  InferredProps = string extends PropsKeys
    ? ComponentObjectPropsOptions extends RuntimePropsOptions
      ? {}
      : ExtractPropTypes<RuntimePropsOptions>
    : { [key in PropsKeys]?: any },
  ResolvedProps = InferredProps & EmitsToProps<RuntimeEmitsOptions>,
>(
  options: CustomElementOptions & {
    props?: (RuntimePropsOptions & ThisType<void>) | PropsKeys[];
  } & ComponentOptionsBase<
      ResolvedProps,
      SetupBindings,
      Data,
      Computed,
      Methods,
      Mixin,
      Extends,
      RuntimeEmitsOptions,
      EmitsKeys,
      {}, // Defaults
      InjectOptions,
      InjectKeys,
      Slots,
      LocalComponents,
      Directives,
      Exposed,
      Provide
    > &
    ThisType<
      CreateComponentPublicInstanceWithMixins<
        Readonly<ResolvedProps>,
        SetupBindings,
        Data,
        Computed,
        Methods,
        Mixin,
        Extends,
        RuntimeEmitsOptions,
        EmitsKeys,
        {},
        false,
        InjectOptions,
        Slots,
        LocalComponents,
        Directives,
        Exposed
      >
    >,
  extraOptions?: CustomElementOptions,
): VueElementConstructor<ResolvedProps>;

// overload 3: defining a custom element from the returned value of
// `defineComponent`
export function defineCustomElement<
  // this should be `ComponentPublicInstanceConstructor` but that type is not exported
  T extends { new (...args: any[]): ComponentPublicInstance<any> },
>(
  options: T,
  extraOptions?: CustomElementOptions,
): VueElementConstructor<T extends DefineComponent<infer P, any, any, any> ? P : unknown>;

/*! #__NO_SIDE_EFFECTS__ */
export function defineCustomElement(
  options: any,
  extraOptions?: ComponentOptions,
  _createApp?: CreateAppFunction<Element>,
): VueElementConstructor {
  // extra process for options
  preprocessComponentOptions(options);
  const Comp = defineComponent(options, extraOptions) as any;
  class VueCustomElement extends VueElement {
    static def = Comp;
    static formAssociated = !!Comp.formAssociated; // must set true if want to access _internals.form
    _internals?: ElementInternals;
    constructor(initialProps?: Record<string, any>) {
      super(Comp, initialProps, _createApp);
      if (this.attachInternals) this._internals = this.attachInternals();
    }
  }

  return VueCustomElement;
}

/*! #__NO_SIDE_EFFECTS__ */
export const defineSSRCustomElement = ((options: any, extraOptions?: ComponentOptions) => {
  // @ts-ignore
  return defineCustomElement(options, extraOptions, createSSRApp);
}) as typeof defineCustomElement;

const BaseClass = (typeof HTMLElement !== 'undefined' ? HTMLElement : class {}) as typeof HTMLElement;

type InnerComponentDef = ConcreteComponent & CustomElementOptions;

declare module 'vue' {
  interface ComponentInternalInstance {
    /**
     * Custom Element instance (if component is created by defineCustomElement)
     * @internal
     */
    ce?: VueElement;
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

  interface App {
    _ceVNode?: VNode;
  }
  interface VNode {
    /**
     * @internal custom element interception hook
     */
    ce?: (instance: ComponentInternalInstance) => void;
  }
}

const shadowRootMap = new WeakMap<HTMLElement, ShadowRoot>();

export class VueElement extends BaseClass implements ComponentCustomElementInterface {
  _isVueCE = true;
  _instance: ComponentInternalInstance | null = null;
  _app: App | null = null;
  // _nonce = this._def.nonce;
  // vue official
  // _teleportTarget?: HTMLElement;

  private _connected = false;
  private _resolved = false;
  private _numberProps: Record<string, true> | null = null;
  /**
   * dev only
   */
  private _styles?: HTMLStyleElement[];

  private _ob?: MutationObserver | null = null;
  private _pendingResolve: Promise<void> | undefined;
  private _parent: VueElement | undefined;
  private _skipRemoveSet = new Set<string>();
  // below three are vue' official support for non-shadowRoot custom element, we don't use that
  /**
   * dev only
   */
  // private _childStyles?: Map<string, HTMLStyleElement[]>;
  // private _styleChildren = new WeakSet();
  // private _slots?: Record<string, Node[]>;

  constructor(
    /**
     * Component def - note this may be an AsyncWrapper, and this._def will
     * be overwritten by the inner component when resolved.
     */
    private _def: InnerComponentDef,
    private _props: Record<string, any> = {},
    private _createApp: CreateAppFunction<Element> = createApp,
  ) {
    super();
    freeze(_def);
    if (__DEV__ && _def.styles && _def.shadowOptions === null) {
      warn(`'styles' option in defineCustomElement will be ignored when shadowOptions is null`);
    }
    if (this.shadowRoot && _createApp !== createApp) {
      shadowRootMap.set(this, this.shadowRoot);
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

  private _setParent(parent = this._parent) {
    if (parent) {
      this._instance!.parent = parent._instance;
      this._instance!.provides = parent._instance!.provides;
    }
  }

  connectedCallback() {
    // if (!this.shadowRoot) {
    //   this._parseSlots();
    // }
    this._connected = true;

    const parent = (this._parent = this._findParent());
    if (isFunction(this._def.onConnected)) this._def.onConnected(this, parent);

    if (!this._instance) {
      if (this._resolved) {
        this._observe();
        this._mount(this._def);
      } else {
        if (parent?._pendingResolve) {
          this._pendingResolve = parent._pendingResolve.then(() => {
            this._pendingResolve = undefined;
            this._resolveDef();
          });
        } else {
          this._resolveDef();
        }
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
        // unmount
        this._app && this._app.unmount();
        if (this._instance) this._instance.ce = undefined;
        this._app = this._instance = null;
      }
    });
  }

  private _observe() {
    if (this._ob) return;
    this._ob = new MutationObserver((mutations) => {
      for (const m of mutations) {
        this._setAttr(m.attributeName!);
      }
    });

    this._ob.observe(this, { attributes: true });
  }

  /**
   * resolve inner component definition (handle possible async component)
   */
  private _resolveDef() {
    if (this._pendingResolve) {
      return;
    }

    // set initial attrs
    for (let i = 0; i < this.attributes.length; i++) {
      this._setAttr(this.attributes[i].name);
    }

    this._observe();

    const resolve = (def: InnerComponentDef, isAsync = false) => {
      this._resolved = true;
      this._pendingResolve = undefined;

      const { props, styles } = def;

      // cast Number-type props set before resolve
      let numberProps;
      if (props && !isArray(props)) {
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

      // initial mount
      this._mount(def);
    };

    const asyncDef = (this._def as ComponentOptions).__asyncLoader;
    if (asyncDef) {
      this._pendingResolve = asyncDef().then((def: ConcreteComponent) => resolve((this._def = def), true));
    } else {
      resolve(this._def);
    }
  }

  private _mount(def: InnerComponentDef) {
    // __FEATURE_PROD_DEVTOOLS__
    if (__DEV__ && !def.name) {
      // @ts-expect-error
      def.name = 'VueElement';
    }
    this._app = this._createApp(def);
    if (def.configureApp) {
      def.configureApp(this._app);
    }
    this._app._ceVNode = this._createVNode();
    this._app.mount(this._def.shadowOptions === null ? this : shadowRootMap.get(this)!);

    // already added useCEExpose, remove below
    // apply expose after mount
    // const exposed = this._instance && this._instance.exposed;
    // if (!exposed) return;
    // for (const key in exposed) {
    //   if (!hasOwn(this, key)) {
    //     // exposed properties are readonly
    //     Object.defineProperty(this, key, {
    //       // unwrap ref to be consistent with public instance behavior
    //       get: () => unref(exposed[key]),
    //     });
    //   } else if (__DEV__) {
    //     warn(`Exposed property "${key}" already exists on custom element.`);
    //   }
    // }
  }

  private _resolveProps(def: InnerComponentDef) {
    const { props } = def;
    const declaredPropKeys = (isArray(props) ? props : objectKeys(props || {})) as string[];

    // check if there are props set pre-upgrade or connect
    for (const key of objectKeys(this) as any) {
      if (key[0] !== '_' && declaredPropKeys.includes(key)) {
        this._setProp(key, this[key as keyof this]);
      }
    }

    // defining getter/setters on prototype
    for (const key of declaredPropKeys.map(camelize)) {
      Object.defineProperty(this, key, {
        get() {
          return this._getProp(key);
        },
        set(val) {
          this._setProp(key, val, true, true);
        },
      });
    }
  }

  protected _setAttr(key: string) {
    const { ignoreAttrs, attrTransform } = this._def;
    if (ignoreAttrs && ignoreAttrs(key, this)) return;
    const has = this.hasAttribute(key);
    const camelKey = camelize(key);
    let value: any = has ? this.getAttribute(key) : REMOVAL;
    if (this._skipRemoveSet.has(camelKey)) {
      if (value === REMOVAL) return;
      else this._skipRemoveSet.delete(camelKey);
    }
    if (has) {
      if (attrTransform) value = attrTransform(key, value, this);
      else if (this._numberProps?.[camelKey]) value = toNumberIfValid(value);
    }
    this._setProp(camelKey, value, false, true);
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
  protected _setProp(key: string, val: any, shouldReflect = true, shouldUpdate = false) {
    if (val !== this._props[key]) {
      if (val === REMOVAL) {
        delete this._props[key];
      } else {
        this._props[key] = val;
        // set key on ceVNode to avoid hydration issue
        if (key === 'key' && this._app) {
          this._app._ceVNode!.key = val;
        }
      }
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
          this._skipRemoveSet.add(key);
          this.removeAttribute(hyphenate(key));
        }
      }
    }
  }

  private _update() {
    render(this._createVNode(), this._def.shadowOptions === null ? this : shadowRootMap.get(this)!);
  }

  private _createVNode(): VNode<any, any> {
    // const baseProps: VNodeProps = {};
    // if (!this.shadowRoot) {
    //   baseProps.onVnodeMounted = baseProps.onVnodeUpdated = this._renderSlots.bind(this);
    // }
    const vnode = createVNode(this._def, Object.assign({}, this._props));
    if (!this._instance) {
      vnode.ce = (instance) => {
        this._instance = instance;
        instance.ce = this;
        instance.isCE = true;
        // HMR
        if (__DEV__) {
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

        const dispatch = (event: string, init: EventInit | undefined, ...args: any[]) => {
          this.dispatchEvent(
            new CustomEvent(event, {
              ...init,
              detail: args.length === 1 ? args[0] : args, // if there is only one argument, take it out
            }),
          );
        };

        // intercept emit
        instance.emit = (event: string, ...args: any[]) => {
          // dispatch both the raw and hyphenated versions of an event
          // to match Vue behavior
          const init = this._def.customEventInit?.[event];
          dispatch(event, init, ...args);
          if (hyphenate(event) !== event) {
            dispatch(hyphenate(event), init, ...args);
          }
        };

        this._setParent();
        if (isFunction(this._def.onCE)) this._def.onCE(instance, this, this._parent);
      };
    }
    return vnode;
  }

  private _applyStyles(styles: (string | CSSStyleSheet)[] | undefined, _owner?: ConcreteComponent) {
    if (_owner === this._def) return;
    const nonce = this._def.nonce;
    if (styles && this.shadowRoot) {
      const sheets: CSSStyleSheet[] = [];
      styles.forEach((css) => {
        if (isCSSStyleSheet(css)) {
          sheets.push(css);
          return;
        }
        const s = createElement(
          'style',
          {
            nonce,
            textContent: css,
          },
          { skipFalsyValue: true },
        );
        this.shadowRoot!.appendChild(s);
        // record for HMR
        if (__DEV__) {
          (this._styles || (this._styles = [])).push(s);
        }
      });
      if (sheets.length)
        // copyCSSStyleSheetsIfNeed is for doc-pip component. when custom-element is moved to another document, it will throw an error: Sharing constructed stylesheets in multiple documents is not allowed
        // so we must check if the stylesheets are shared between documents, if so, we must clone them
        this.shadowRoot.adoptedStyleSheets.push(...copyCSSStyleSheetsIfNeed(sheets, this));
    }
  }

  /**
   * must... it's added in vue 3.5, it will be called in vue's renderer
   * @internal
   */
  _injectChildStyle(comp: ConcreteComponent & CustomElementOptions): void {
    this._applyStyles(comp.styles, comp);
  }

  /**
   * @internal
   */
  _removeChildStyle(_comp: ConcreteComponent): void {}
}
