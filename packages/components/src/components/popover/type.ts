import {
  GetEventPropsFromEmits,
  PropBoolean,
  PropNumber,
  PropObjOrFunc,
  PropObject,
  PropString,
  createTransitionProps,
  themeProps,
} from 'common';
import { Placement } from '@floating-ui/vue';
import type { MaybeRefLikeOrGetter, PopoverTrigger, Responsive, VirtualElement } from '@lun/core';
import type { CSSProperties, ExtractPropTypes, PropType, VNode } from 'vue';

export const popoverProps = {
  ...createTransitionProps(),

  open: PropBoolean(),
  target: PropObject<MaybeRefLikeOrGetter<Element | VirtualElement>>(),
  type: PropString<'popover' | 'fixed' | 'teleport'>(),
  to: PropString(),

  content: {},
  contentType: PropString(),
  preferHtml: PropBoolean(),
  children: PropObjOrFunc<VNode | ((param: { isShow: boolean; isOpen: boolean }) => VNode)>(),

  placement: PropString<Placement>(),
  offset: PropNumber(),
  showArrow: PropBoolean(),

  // make the pop content the same width or height as the target element.
  sync: PropString<'width' | 'height' | 'both'>(),
  adjustPopStyle: {
    type: Function as PropType<(result: CSSProperties, middlewareData: Record<string, any>) => CSSProperties | void>,
  },
  // whether use transform to position, useful when has animation conflict
  useTransform: PropBoolean(),

  openDelay: PropNumber(),
  closeDelay: PropNumber(),
  triggers: { type: [String, Array] as PropType<PopoverTrigger | PopoverTrigger[]> },
  /** it's only for click trigger, used to toggle open and close state when click. */
  toggleMode: PropBoolean(),
  beforeOpen: { type: Function as PropType<() => boolean | void> },

  ...themeProps,
  variant: PropString<'styleless' | string>(),
  size: { type: [String, Object] as PropType<Responsive<'1' | '2' | '3'>> },
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
