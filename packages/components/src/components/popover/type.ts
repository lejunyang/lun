import { Placement } from '@floating-ui/vue';
import type { PopoverTrigger } from '@lun/core';
import type { CSSProperties, ExtractPropTypes, PropType } from 'vue';

export const popoverProps = {
  show: { type: Boolean, default: undefined },
  type: { type: String as PropType<'popover' | 'dialog' | 'fixed' | 'body-fixed'> },
  content: {},
  placement: { type: String as PropType<Placement> },
  offset: { type: Number },
  // TODO rename
  openDelay: { type: Number },
  closeDelay: { type: Number },
  triggers: { type: [String, Array] as PropType<PopoverTrigger | PopoverTrigger[]> },
  // whether to toggle when retrigger, useful for select(TODO select also need input to trigger)
  toggleMode: { type: Boolean },
  fullPopWidth: { type: Boolean },
  adjustPopStyle: {
    type: Function as PropType<(result: CSSProperties, middlewareData: Record<string, any>) => CSSProperties | void>,
  },
  showArrow: { type: Boolean },
  // whether use transform to position, useful when has animation conflict
  useTransform: { type: Boolean, default: false, },
};

export type PopoverProps = ExtractPropTypes<typeof popoverProps>;

declare module 'vue' {
  export interface IntrinsicElementAttributes {
    'l-popover': PopoverProps &
      HTMLAttributes & {
        isShow: () => boolean;
        delayShowPopover: () => void;
        delayHidePopover: () => void;
      };
  }
}
