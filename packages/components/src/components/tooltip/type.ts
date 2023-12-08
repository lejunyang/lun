import { ExtractPropTypes, PropType } from 'vue';
import { popoverProps } from '../popover/type';

export const tooltipProps = {
  ...popoverProps,
  overflow: { type: String as PropType<'enable' | 'open'> },
};

export type TooltipProps = ExtractPropTypes<typeof tooltipProps>;
