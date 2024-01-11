import {
  GetEventPropsFromEmits,
  PropBoolean,
  PropFunction,
  PropNumber,
  PropObjOrFunc,
  PropObject,
  PropStrOrArr,
  PropString,
  createTransitionProps,
  themeProps,
} from 'common';
import { Placement } from '@floating-ui/vue';
import type { MaybeRefLikeOrGetter, PopoverTrigger, VirtualElement } from '@lun/core';
import type { CSSProperties, ExtractPropTypes, VNode } from 'vue';

export const popoverProps = {
  ...createTransitionProps(),

  /** used to manually set the open state of popover */
  open: PropBoolean(),
  /** used to manually set the anchor target of popover */
  target: PropObject<MaybeRefLikeOrGetter<Element | VirtualElement>>(),
  /** determine the implementation type of popover */
  type: PropString<'popover' | 'fixed' | 'teleport'>(),
  /** determine the teleport target when 'type' is 'teleport', default to 'body' */
  to: PropString(),

  content: {},
  contentType: PropString(),
  preferHtml: PropBoolean(),
  children: PropObjOrFunc<VNode | ((param: { isShow: boolean; isOpen: boolean }) => VNode)>(),

  placement: PropString<Placement>(),
  offset: PropNumber(),
  showArrow: PropBoolean(),

  /** used to make the pop content same width or height as the target element. */
  sync: PropString<'width' | 'height' | 'both'>(),
  /** used to dynamically set styles of pop element */
  adjustPopStyle: PropFunction<(result: CSSProperties, middlewareData: Record<string, any>) => CSSProperties | void>(),
  /** determine whether to use transform to position, useful when has animation conflict. */
  useTransform: PropBoolean(),

  openDelay: PropNumber(),
  closeDelay: PropNumber(),
  triggers: PropStrOrArr<PopoverTrigger | PopoverTrigger[]>(),
  /** it's only for click trigger, used to toggle open and close state when click. */
  toggleMode: PropBoolean(),
  beforeOpen: PropFunction<() => boolean | void>(),

  ...themeProps,
  variant: PropString<'styleless' | string>(),
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
