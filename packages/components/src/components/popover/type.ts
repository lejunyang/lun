import {
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
import type { Placement, ShiftOptions } from '@floating-ui/vue';
import type { Derivable } from '@floating-ui/core';
import type { MaybeRefLikeOrGetter, PopoverTrigger, VirtualElement } from '@lun/core';
import type { CSSProperties, ExtractPropTypes, VNode } from 'vue';
import { Constructor } from '@lun/utils';

export const popoverProps = {
  ...createTransitionProps(),
  /** note that it will not inherit edit state's disabled */
  disabled: PropBoolean(),
  /** used to manually set the open state of popover */
  open: PropBoolean(),
  /** used to manually set the anchor target of popover */
  target: PropObject<MaybeRefLikeOrGetter<Element | VirtualElement>>(),
  /** determine the implementation type of popover */
  type: PropString<'popover' | 'fixed' | 'teleport'>(),
  /** determine the teleport target when 'type' is 'teleport', if it's falsy, it will be the first theme-provider */
  to: PropObjOrStr<MaybeRefLikeOrGetter<string | HTMLElement>>(),

  /** pop content, will use CustomRenderer to render it. can be a function, current popover target will be the first parameter  */
  content: {},
  contentType: PropString(),
  preferHtml: PropBoolean(),
  children: PropObjOrFunc<VNode | ((param: { isShow: boolean; isOpen: boolean }) => VNode)>(),

  placement: PropString<Placement>(),
  offset: PropNumber(),
  showArrow: PropBoolean(),
  shift: PropObjOrBool<boolean | ShiftOptions, Constructor<Derivable<ShiftOptions>>[]>(Function as any),

  /** used to make the pop content same width or height as the target element. */
  sync: PropString<'width' | 'height' | 'both'>(),
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
  /** function that will be called before open the popover, return false to prevent open the popover */
  beforeOpen: PropFunction<(target: Element | VirtualElement) => boolean | void>(),

  ...themeProps,
  variant: PropString<'styleless' | string>(),

  /** @private internal usage */
  rootClass: PropStrOrArr(),
};

export const popoverEmits = {
  open: null,
  afterOpen: null,
  close: null,
  afterClose: null,
};

export type PopoverSetupProps = ExtractPropTypes<typeof popoverProps>;
export type PopoverEvents = GetEventPropsFromEmits<typeof popoverEmits>;
export type PopoverProps = Partial<PopoverSetupProps>;
