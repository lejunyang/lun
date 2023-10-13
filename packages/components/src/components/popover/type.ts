import { Placement } from '@floating-ui/vue';
import type { PopoverTrigger } from '@lun/core';
import type { ExtractPropTypes, PropType } from 'vue';

export const popoverProps = {
  show: { type: Boolean, default: undefined },
  type: { type: String as PropType<'popover' | 'dialog' | 'fixed' | 'body-fixed'> },
  content: {},
  placement: { type: String as PropType<Placement> },
  showDelay: { type: Number },
  hideDelay: { type: Number },
  triggers: { type: [String, Array] as PropType<PopoverTrigger | PopoverTrigger[]> },
};

export type PopoverProps = ExtractPropTypes<typeof popoverProps>;

declare module 'vue' {
  export interface IntrinsicElementAttributes {
    'l-popover': PopoverProps & HTMLAttributes
  }
}