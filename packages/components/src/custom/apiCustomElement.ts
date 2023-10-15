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
  ObjectEmitsOptions,
  VueElementConstructor,
} from 'vue';
import { hyphenate, preprocessComponentOptions } from '../utils';
import { toNumberIfValid } from '@lun/utils';
import { NotBindEvents, createPlainEvent, delegateEvent } from '../utils/event';

export type ExtractCEPropTypes<T> = T extends VueElementConstructor<ExtractPropTypes<infer P>> ? P : never;
type EventInit = {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
};
export type EventInitMap = Record<string, EventInit>;
export type PropUpdateCallback = (key: string, value: any, el: HTMLElement) => void;
export type CECallback = (instance: ComponentInternalInstance, el: VueElement, parent?: VueElement) => void;
export type Style = string | CSSStyleSheet;

// defineCustomElement provides the same type inference as defineComponent
// so most of the following overloads should be kept in sync w/ defineComponent.

// overload 1: direct setup function
export function defineCustomElement<Props, RawBindings = object>(
  setup: (props: Readonly<Props>, ctx: SetupContext) => RawBindings | RenderFunction
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
  S extends SlotsType = {}
>(
  options: ComponentOptionsWithoutProps<Props, RawBindings, D, C, M, Mixin, Extends, E, EE, I, II, S> & {
    styles?: Style[];
    noShadow?: boolean;
    customEventInit?: EventInitMap;
    onPropUpdate?: PropUpdateCallback;
    onCE?: CECallback;
    delegateCEEvents?: { targetId: string; events: string[] };
  }
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
  S extends SlotsType = {}
>(
  options: ComponentOptionsWithArrayProps<PropNames, RawBindings, D, C, M, Mixin, Extends, E, EE, I, II, S> & {
    styles?: Style[];
    noShadow?: boolean;
    customEventInit?: EventInitMap;
    onPropUpdate?: PropUpdateCallback;
    onCE?: CECallback;
    delegateCEEvents?: { targetId: string; events: string[] };
  }
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
  S extends SlotsType = {}
>(
  options: ComponentOptionsWithObjectProps<PropsOptions, RawBindings, D, C, M, Mixin, Extends, E, EE, I, II, S> & {
    styles?: Style[];
    noShadow?: boolean;
    customEventInit?: EventInitMap;
    onPropUpdate?: PropUpdateCallback;
    onCE?: CECallback;
    delegateCEEvents?: { targetId: string; events: string[] };
  }
): VueElementConstructor<ExtractPropTypes<PropsOptions>>;

// overload 5: defining a custom element from the returned value of
// `defineComponent`
export function defineCustomElement(options: { new (...args: any[]): ComponentPublicInstance }): VueElementConstructor;

/*! #__NO_SIDE_EFFECTS__ */
export function defineCustomElement(options: any, hydrate?: RootHydrateFunction): VueElementConstructor {
  // extra process for options
  preprocessComponentOptions(options);
  const Comp = defineComponent(options) as any;
  class VueCustomElement extends VueElement {
    static def = Comp;
    constructor(initialProps?: Record<string, any>) {
      super(Comp, initialProps, hydrate);
    }
  }

  return VueCustomElement as any;
}

/*! #__NO_SIDE_EFFECTS__ */
export const defineSSRCustomElement = ((options: any) => {
  // @ts-ignore
  return defineCustomElement(options, hydrate);
}) as typeof defineCustomElement;

const BaseClass = (typeof HTMLElement !== 'undefined' ? HTMLElement : class {}) as typeof HTMLElement;

type InnerComponentDef = ConcreteComponent & {
  styles?: Style[];
  noShadow?: boolean;
  customEventInit?: EventInitMap;
  onPropUpdate?: PropUpdateCallback;
  onCE?: CECallback;
  delegateCEEvents?: { targetId: string; events: string[] };
};

declare module 'vue' {
  interface ComponentInternalInstance {
    event: ReturnType<typeof createPlainEvent>;
    rootNotBindEvents?: NotBindEvents;
    /**
     * resolved emits options
     * @internal
     */
    emitsOptions: ObjectEmitsOptions | null;
  }
  interface VNode {
    /**
     * @internal custom element interception hook
     */
    ce?: (instance: ComponentInternalInstance) => void;
  }
  interface ComponentInternalInstance {
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
}

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
  private _notBindEvents?: NotBindEvents;

  constructor(
    private _def: InnerComponentDef,
    private _props: Record<string, any> = {},
    hydrate?: RootHydrateFunction
  ) {
    super();
    if (_def.noShadow) {
      if (__DEV__ && _def.styles) {
        warn(`styles option in the custom components will not be ignored when noShadow is true`);
      }
    }
    if (this.shadowRoot && hydrate) {
      hydrate(this._createVNode(), this.shadowRoot);
    } else {
      if (__DEV__ && this.shadowRoot) {
        warn(
          `Custom element has pre-rendered declarative shadow root but is not ` +
            `defined as hydratable. Use \`defineSSRCustomElement\`.`
        );
      }
      if (!this._def.noShadow) this.attachShadow({ mode: 'open' });
      if (!(this._def as ComponentOptions).__asyncLoader) {
        // for sync component defs we can immediately resolve props
        this._resolveProps(this._def);
      }
    }
    if (!_def.noShadow && _def.delegateCEEvents?.targetId && _def.delegateCEEvents.events) {
      const result = delegateEvent(
        this,
        () => {
          return this.shadowRoot!.getElementById(_def.delegateCEEvents!.targetId);
        },
        _def.delegateCEEvents.events
      );
      this._notBindEvents = result?.notBindEvents;
    }
  }

  get dom(): VueElement | ShadowRoot | null {
    return this._def.noShadow ? this : this.shadowRoot;
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
    if (this._ob) {
      this._ob.disconnect();
      this._ob = null;
    }
    nextTick(() => {
      if (!this._connected) {
        render(null, this.dom!);
        this._instance = null;
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
          if (opt === Number || (opt && opt.type === Number)) {
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
    let value: any = this.getAttribute(key);
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
      if (this._def.onPropUpdate instanceof Function) this._def.onPropUpdate(key, val, this);
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
    render(this._createVNode(), this.dom!);
  }

  private _createVNode(): VNode<any, any> {
    const vnode = createVNode(this._def, Object.assign({}, this._props));
    if (!this._instance) {
      vnode.ce = (instance) => {
        instance.rootNotBindEvents = this._notBindEvents;
        this._instance = instance;
        instance.isCE = true;
        instance.event = createPlainEvent(); // add Event Manager
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

        const dispatch = (event: string, ...args: any[]) => {
          instance.event.emit(event, ...args);
          this.dispatchEvent(
            new CustomEvent(event, {
              ...this._def.customEventInit?.[event],
              detail: args.length === 1 ? args[0] : args, // 如果只有一个参数则取出
            })
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

        // locate nearest Vue custom element parent for provide/inject
        let parent: Node | null = this;
        // parentNode of shadowRoot is null, use host to get parentNode
        while ((parent = parent && (parent.parentNode || (parent as ShadowRoot).host))) {
          if (parent instanceof VueElement) {
            instance.parent = parent._instance;
            instance.provides = parent._instance!.provides;
            break;
          }
        }

        if (this._def.onCE instanceof Function) this._def.onCE(instance, this, parent);
      };
    }
    return vnode;
  }

  private _applyStyles(styles: (string | CSSStyleSheet)[] | undefined) {
    if (styles && !this._def.noShadow) {
      const sheets: CSSStyleSheet[] = [];
      styles.forEach((css) => {
        if (typeof CSSStyleSheet === 'function' && css instanceof CSSStyleSheet) {
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
      if (sheets.length) this.shadowRoot!.adoptedStyleSheets = sheets;
    }
  }
}
