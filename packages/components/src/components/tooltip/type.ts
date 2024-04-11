import { ExtractPropTypes, PropType } from 'vue';
import { popoverEmits, popoverProps } from '../popover/type';
import { GetEventPropsFromEmits } from 'common';

export const tooltipProps = {
  ...popoverProps,
  overflow: { type: String as PropType<'enable' | 'open'> },
};

export const tooltipEmits = {
  ...popoverEmits,
  overflowChange: (_param: { isOverflow: boolean; target: Element }) => true,
};

export type TooltipSetupProps = ExtractPropTypes<typeof tooltipProps>;
export type TooltipEvents = GetEventPropsFromEmits<typeof tooltipEmits>;
export type TooltipProps = Partial<TooltipSetupProps> & TooltipEvents;
