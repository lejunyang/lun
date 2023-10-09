import type { PopoverTrigger } from '@lun/core';
import type { ExtractPropTypes, PropType } from 'vue';

export const popoverProps = {
  type: { type: String as PropType<'popover' | 'dialog' | 'fixed' | 'teleportFixed'> },
  content: {},
  showDelay: { type: Number },
  hideDelay: { type: Number },
  triggers: { type: [String, Array] as PropType<PopoverTrigger | PopoverTrigger[]> },
};

export type PopoverProps = ExtractPropTypes<typeof popoverProps>;
