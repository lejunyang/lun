import {
  CommonProps,
  GetEventPropsFromEmits,
  PropBoolean,
  PropFunction,
  PropNumber,
  PropObjOrBool,
  PropObjOrFunc,
  PropObjOrStr,
  PropObject,
  PropStrOrArr,
  PropString,
  createTransitionProps,
  themeProps,
} from 'common';
import type { AutoUpdateOptions, FlipOptions, Placement, ShiftOptions } from '@floating-ui/vue';
import type { Derivable, InlineOptions } from '@floating-ui/core';
import type { MaybeRefLikeOrGetter, PopoverTrigger, VirtualElement } from '@lun/core';
import type { CSSProperties, ExtractPropTypes, VNode } from 'vue';
import { Constructor, freeze } from '@lun/utils';

export const popoverProps = freeze({
  ...createTransitionProps(),
  /** note that it will not inherit edit state's disabled */
  disabled: PropObjOrBool<MaybeRefLikeOrGetter<boolean>>(),
  /** used to manually set the open state of popover */
  open: PropBoolean(),
  /** determine whether to freeze content update when pop is closing */
  freezeWhenClosing: PropBoolean(),
  /** used to manually set the anchor target of popover */
  target: PropObject<MaybeRefLikeOrGetter<Element | VirtualElement>>(),
  /** determine the implementation type of popover */
  type: PropString<'popover' | 'position' | 'teleport'>(),
  /** used to turn on CSS anchor positioning and specify the anchor-name for custom element itself */
  anchorName: PropString(),
  /** determine the teleport target when 'type' is 'teleport', if it's falsy, it will be the first theme-provider */
  to: PropObjOrStr<MaybeRefLikeOrGetter<string | HTMLElement>>(),

  /** pop content, will use CustomRenderer to render it. can be a function, current popover target will be the first parameter  */
  content: {},
  contentType: PropString(),
  preferHtml: PropBoolean(),
  defaultChildren: PropObjOrFunc<VNode | ((param: { isShow: boolean; isOpen: boolean }) => VNode)>(), // it was named as 'children', but 'children' is a reserved prop in react

  strategy: PropString<'fixed' | 'absolute'>(),
  placement: PropString<Placement>(),
  arrowPosition: PropString<'start' | 'center' | 'end' | 'auto'>(),
  /** @link https://floating-ui.com/docs/offset */
  offset: PropNumber(),
  showArrow: PropBoolean(),
  /** offset of arrow from popover edge, effective only when arrowPosition is not center */
  arrowOffset: PropNumber(),
  /** @link https://floating-ui.com/docs/flip */
  flip: PropObjOrBool<boolean | FlipOptions, Constructor<Derivable<FlipOptions>>[]>(Function as any),
  /** @link https://floating-ui.com/docs/shift */
  shift: PropObjOrBool<boolean | ShiftOptions, Constructor<Derivable<ShiftOptions>>[]>(Function as any),
  /** @link https://floating-ui.com/docs/inline */
  inline: PropObjOrBool<boolean | InlineOptions, Constructor<Derivable<ShiftOptions>>[]>(Function as any),
  /** @link https://floating-ui.com/docs/autoUpdate */
  autoUpdateOptions: PropObject<AutoUpdateOptions>(),

  /** used to set the width of pop content, can be css width value or special value 'anchorWidth', 'anchorHeight', which will make the pop content same width or height as the anchor element */
  popWidth: PropNumber(),
  /** used to set the height of pop content, can be css height value or special value 'anchorWidth', 'anchorHeight', which will make the pop content same width or height as the anchor element */
  popHeight: PropNumber(),
  zIndex: PropNumber(),
  /** used to dynamically set styles of pop element */
  adjustPopStyle: PropFunction<(result: CSSProperties, middlewareData: Record<string, any>) => CSSProperties | void>(),
  /** determine whether to use transform to position, useful when has animation conflict. */
  useTransform: PropBoolean(),

  openDelay: PropNumber(),
  closeDelay: PropNumber(),
  triggers: PropStrOrArr<PopoverTrigger | PopoverTrigger[]>(),
  /** it's only for click trigger, used to toggle open and close state when click. */
  toggleMode: PropBoolean(),
  /**
   * it's only for click and contextmenu trigger, it's to determine the pop target.
   * If is's rect(which is default), pop target is popover element itself; if it's coord, pop target is the pointer coordinate when clicking
   */
  pointerTarget: PropString<'rect' | 'coord'>(),
  /** it's for multiple targets(manually attachTarget) */
  preventSwitchWhen: PropString<'focus' | 'edit'>(),
  /** function that will be called before open the popover, return false to prevent open the popover */
  beforeOpen: PropFunction<(target: Element | VirtualElement) => boolean | void>(),

  ...themeProps,
  variant: PropString<'styleless' | string>(),

  /** @private internal usage */
  rootClass: PropStrOrArr(),
});

export const popoverEmits = freeze({
  open: null,
  afterOpen: null,
  close: null,
  afterClose: null,
});

export type PopoverSetupProps = ExtractPropTypes<typeof popoverProps> & CommonProps;
export type PopoverEvents = GetEventPropsFromEmits<typeof popoverEmits>;
export type PopoverProps = Partial<PopoverSetupProps> & PopoverEvents;
