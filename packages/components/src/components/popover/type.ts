import {
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  OpenCloseEmits,
  Prop,
  PropBoolean,
  PropFunction,
  PropNumber,
  PropObjOrBool,
  PropObjOrFunc,
  PropObjOrStr,
  PropObject,
  PropStrOrArr,
  PropString,
  createEmits,
  createTransitionProps,
  openCloseEmits,
  themeProps,
  undefBoolProp,
} from 'common';
import type { AutoUpdateOptions, FlipOptions, Placement, ShiftOptions } from '@floating-ui/vue';
import type { Derivable, InlineOptions } from '@floating-ui/core';
import type { MaybeRefLikeOrGetter, PopoverTrigger, VirtualElement } from '@lun-web/core';
import type { CSSProperties, ExtractPropTypes, VNode } from 'vue';
import { Constructor, freeze } from '@lun-web/utils';
import { GetCustomRendererSource } from '../custom-renderer';

export const popoverFloatingUIProps = freeze({
  /**
   * @locale.zh-CN 定位策略，决定弹出层的 CSS position 类型
   * @locale.en Positioning strategy, controls the CSS position type of the pop layer
   */
  strategy: PropString<'fixed' | 'absolute'>(),
  /**
   * @locale.zh-CN 弹出层相对目标的位置
   * @locale.en Placement of the pop layer relative to its target
   */
  placement: PropString<Placement>(),
  /**
   * @locale.zh-CN 箭头相对目标边的对齐位置
   * @locale.en Alignment of the arrow along the target's edge
   * @default 'auto'
   */
  arrowPosition: PropString<'start' | 'center' | 'end' | 'auto'>(),
  /**
   * @locale.zh-CN 弹出层与目标元素之间的距离（像素），对应 floating-ui 的 offset
   * @locale.en Distance in pixels between the pop layer and the target element, corresponds to floating-ui's offset
   * @default 4
   */
  offset: PropNumber(),
  /**
   * @locale.zh-CN 是否显示箭头
   * @locale.en Whether to show the arrow
   * @default true
   */
  showArrow: undefBoolProp,
  /**
   * @locale.zh-CN 箭头相对弹出层边缘的偏移，仅当 arrowPosition 不为 center 时生效
   * @locale.en Offset of the arrow from the pop layer's edge, only effective when arrowPosition is not center
   * @default 15
   */
  arrowOffset: PropNumber(),
  /**
   * @locale.zh-CN 自动翻转配置，启用后弹出层超出视口时会自动翻转方向，对应 floating-ui 的 flip 插件
   * @locale.en Auto-flip configuration; when enabled, the pop layer flips its side when overflowing the viewport, corresponds to floating-ui's flip middleware
   */
  flip: PropObjOrBool<boolean | FlipOptions, Constructor<Derivable<FlipOptions>>[]>(Function as any),
  /**
   * @locale.zh-CN 自动偏移配置，启用后弹出层超出容器时会自动平移以保持可见，对应 floating-ui 的 shift 插件
   * @locale.en Auto-shift configuration; when enabled, the pop layer is translated to stay within the container, corresponds to floating-ui's shift middleware
   */
  shift: PropObjOrBool<boolean | ShiftOptions, Constructor<Derivable<ShiftOptions>>[]>(Function as any),
  /**
   * @locale.zh-CN 内联模式配置，针对跨行内联元素优化定位，对应 floating-ui 的 inline 插件
   * @locale.en Inline mode configuration that optimizes placement for inline targets spanning multiple lines, corresponds to floating-ui's inline middleware
   */
  inline: PropObjOrBool<boolean | InlineOptions, Constructor<Derivable<ShiftOptions>>[]>(Function as any),
  /**
   * @locale.zh-CN 自动更新位置的选项，对应 floating-ui 的 autoUpdate
   * @locale.en Options for auto-updating the position, corresponds to floating-ui's autoUpdate
   */
  autoUpdateOptions: PropObject<AutoUpdateOptions>(),
});

export const popoverProps = freeze({
  ...createTransitionProps('pop'),
  /**
   * @locale.zh-CN 是否禁用 popover，注意它不会继承编辑状态的 disabled
   * @locale.en Whether to disable the popover; note that it will not inherit edit state's disabled
   */
  disabled: PropObjOrBool<MaybeRefLikeOrGetter<boolean>>(),
  /**
   * @locale.zh-CN 用于手动控制 popover 的打开状态
   * @locale.en Used to manually control the popover's open state
   */
  open: undefBoolProp,
  /**
   * @locale.zh-CN 弹出层关闭过程中是否冻结内容更新，避免关闭动画期间内容闪烁
   * @locale.en Whether to freeze content updates while the pop layer is closing, to avoid flicker during the close animation
   */
  freezeWhenClosing: PropBoolean(),
  /**
   * @locale.zh-CN 手动指定 popover 的锚点目标，可以是元素或虚拟元素
   * @locale.en Manually specify the popover's anchor target; accepts an element or a virtual element
   */
  target: PropObject<MaybeRefLikeOrGetter<Element | VirtualElement>>(),
  /**
   * @locale.zh-CN 指定子元素上用作单例监听多目标的属性名，匹配该属性的子元素会被自动作为 popover 的触发目标
   * @locale.en Attribute name on slotted children used for multi-target auto-attach; matching children become popover targets automatically
   */
  autoAttachAttr: PropString(),
  /**
   * @locale.zh-CN 为 true 时 popover 自身不作为触发目标，结合 autoAttachAttr 使用且不需要默认内容时很有用
   * @locale.en When true, the popover itself is not a target; useful together with autoAttachAttr when there is no default pop content
   */
  ignoreSelf: PropBoolean(),
  /**
   * @locale.zh-CN 指定 popover 的实现方式：popover 使用原生 Popover API；normal 在原位渲染；teleport 渲染到 teleport-holder
   * @locale.en Implementation type: 'popover' uses the native Popover API, 'normal' renders in place, 'teleport' renders into the teleport-holder
   */
  type: PropString<'popover' | 'normal' | 'teleport'>(),
  /**
   * @locale.zh-CN 启用 CSS 锚点定位并指定自定义元素自身的 anchor-name
   * @locale.en Turns on CSS anchor positioning and specifies the anchor-name for the custom element itself
   */
  anchorName: PropString(),
  /**
   * @locale.zh-CN 当 type=teleport 时弹出内容的渲染目标；若为空，则使用第一个 theme-provider
   * @locale.en Teleport target when type is 'teleport'; falls back to the first theme-provider when falsy
   */
  to: PropObjOrStr<MaybeRefLikeOrGetter<string | HTMLElement>>(),

  /**
   * @locale.zh-CN 自定义弹出内容，可返回字符串或 custom-renderer 的 props；也可以是函数，参数为当前 popover 的目标元素
   * @locale.en Custom pop content; can return a string or custom-renderer props, or be a function receiving the current popover target as its first parameter
   */
  content: Prop<GetCustomRendererSource<[Element | VirtualElement]>>(),
  /**
   * @locale.zh-CN React 端用于替代 children 的默认插槽内容，因为 children 是 React 的保留 prop
   * @locale.en Default slot content used by the React wrapper as a replacement for `children`, since `children` is reserved in React
   */
  defaultChildren: PropObjOrFunc<VNode | ((param: { isShow: boolean; isOpen: boolean }) => VNode)>(), // it was named as 'children', but 'children' is a reserved prop in react

  ...popoverFloatingUIProps,

  /**
   * @locale.zh-CN 弹出内容宽度，可为任意 CSS 长度值；特殊值 'anchorWidth' / 'anchorHeight' 会让宽度与锚点元素的宽或高一致
   * @locale.en Width of the pop content; accepts any CSS length, or the special values 'anchorWidth' / 'anchorHeight' to match the anchor element's width or height
   * @default 'max-content'
   */
  popWidth: PropNumber(),
  /**
   * @locale.zh-CN 弹出内容高度，可为任意 CSS 长度值；特殊值 'anchorWidth' / 'anchorHeight' 会让高度与锚点元素的宽或高一致
   * @locale.en Height of the pop content; accepts any CSS length, or the special values 'anchorWidth' / 'anchorHeight' to match the anchor element's width or height
   */
  popHeight: PropNumber(),
  /**
   * @locale.zh-CN 弹出层的 z-index，未设置时使用全局配置中的 popover 层级
   * @locale.en z-index of the pop layer; falls back to the global popover z-index from context config when unset
   */
  zIndex: PropNumber(),
  /**
   * @locale.zh-CN 动态调整弹出元素样式的函数，接收已计算的样式和中间件数据，返回新的样式或不返回
   * @locale.en Function for dynamically adjusting the pop element's styles; receives the computed styles and middleware data, returns the new styles or nothing
   */
  adjustPopStyle: PropFunction<(result: CSSProperties, middlewareData: Record<string, any>) => CSSProperties | void>(),
  /**
   * @locale.zh-CN 是否使用 transform 进行定位，可避免与动画冲突
   * @locale.en Whether to use transform for positioning; useful when there are animation conflicts
   * @default false
   */
  useTransform: PropBoolean(),

  /**
   * @locale.zh-CN 触发打开 popover 的延迟（毫秒）
   * @locale.en Delay in milliseconds before the popover opens
   */
  openDelay: PropNumber(),
  /**
   * @locale.zh-CN 关闭 popover 的延迟（毫秒）
   * @locale.en Delay in milliseconds before the popover closes
   */
  closeDelay: PropNumber(),
  /**
   * @locale.zh-CN 触发方式，可单个或多个组合，支持 hover、click、pointerdown、focus、edit、contextmenu、select
   * @locale.en Trigger method(s); single value or array combining hover, click, pointerdown, focus, edit, contextmenu, select
   */
  triggers: PropStrOrArr<PopoverTrigger | PopoverTrigger[]>(),
  /**
   * @locale.zh-CN 仅作用于 click 触发，开启后点击目标会在打开与关闭之间切换
   * @locale.en Only for the click trigger; when enabled, clicking the target toggles open/close state
   */
  toggleMode: PropBoolean(),
  /**
   * @locale.zh-CN 仅作用于 click 和 contextmenu，决定弹出层定位的目标：'rect' 以 popover 元素自身矩形为目标；'coord' 以点击时的指针坐标为目标
   * @locale.en Only for click and contextmenu triggers; determines the pop target: 'rect' uses the popover element's own rect, 'coord' uses the pointer coordinates at click time
   */
  pointerTarget: PropString<'rect' | 'coord'>(),
  /**
   * @locale.zh-CN 多目标场景下，阻止 popover 切换目标的时机：focus 表示某目标聚焦时不切换；edit 表示编辑时不切换
   * @locale.en In multi-target scenarios, when to prevent the popover from switching targets: 'focus' prevents switching while a target is focused; 'edit' prevents switching while editing
   */
  preventSwitchWhen: PropString<'focus' | 'edit'>(),
  /**
   * @locale.zh-CN 打开 popover 之前的回调，返回 false 可阻止打开
   * @locale.en Callback invoked before opening the popover; return false to prevent it from opening
   */
  beforeOpen: PropFunction<(target: Element | VirtualElement) => boolean | void>(),
  /**
   * @locale.zh-CN 当前目标更新后的回调，参数为新目标和旧目标；返回 false 会立即关闭 popover
   * @locale.en Callback invoked after the current target has changed, receiving the new and previous targets; return false to close the popover immediately
   */
  afterTargetUpdate:
    PropFunction<
      (current: Element | VirtualElement | undefined, old: Element | VirtualElement | undefined) => void | boolean
    >(),

  ...themeProps,
  /**
   * @locale.zh-CN 视觉变体；设为 'styleless' 时不应用组件默认样式
   * @locale.en Visual variant; set to 'styleless' to skip the component's default styles
   */
  variant: PropString<'styleless' | string>(),

  /** @internal */
  rootClass: PropStrOrArr(),
});

export const popoverEmits = createEmits<OpenCloseEmits>(openCloseEmits);

export type PopoverSetupProps = ExtractPropTypes<typeof popoverProps> & CommonProps;
export type PopoverEventProps = GetEventPropsFromEmits<typeof popoverEmits>;
export type PopoverEventMap = GetEventMapFromEmits<typeof popoverEmits>;
export type PopoverProps = Partial<PopoverSetupProps> & PopoverEventProps;
