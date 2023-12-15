import { GetEventPropsFromEmits, PropBoolean, PropNumber, PropObject, PropString, themeProps } from 'common';
import { Placement } from '@floating-ui/vue';
import type { MaybeRefLikeOrGetter, PopoverTrigger, Responsive, VirtualElement } from '@lun/core';
import type { CSSProperties, ExtractPropTypes, PropType } from 'vue';
import { omit } from '@lun/utils';

export const popoverProps = {
  open: PropBoolean(),
  target: PropObject<MaybeRefLikeOrGetter<Element | VirtualElement>>(),
  type: PropString<'popover' | 'fixed' | 'teleport'>(),
  to: PropString(),

  content: {},
  contentType: PropString(),
  preferHtml: PropBoolean(),

  placement: PropString<Placement>(),
  offset: PropNumber(),
  showArrow: PropBoolean(),

  // pop width will be same as target width
  fullPopWidth: PropBoolean(),
  adjustPopStyle: {
    type: Function as PropType<(result: CSSProperties, middlewareData: Record<string, any>) => CSSProperties | void>,
  },
  // whether use transform to position, useful when has animation conflict
  useTransform: PropBoolean(),

  openDelay: PropNumber(),
  closeDelay: PropNumber(),
  triggers: { type: [String, Array] as PropType<PopoverTrigger | PopoverTrigger[]> },
  // whether to toggle when retrigger, useful for select(TODO select also need input to trigger)
  toggleMode: PropBoolean(),
  beforeOpen: { type: Function as PropType<() => boolean | void> },

  ...omit(themeProps, ['variant']),
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
