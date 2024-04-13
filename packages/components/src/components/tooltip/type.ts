import { ExtractPropTypes, PropType } from 'vue';
import { popoverEmits, popoverProps } from '../popover/type';
import { CommonProps, GetEventPropsFromEmits } from 'common';
import { freeze } from '@lun/utils';

export const tooltipProps = freeze({
  ...popoverProps,
  overflow: { type: String as PropType<'enable' | 'open'> },
});

export const tooltipEmits = freeze({
  ...popoverEmits,
  overflowChange: (_param: { isOverflow: boolean; target: Element }) => true,
});

export type TooltipSetupProps = ExtractPropTypes<typeof tooltipProps> & CommonProps;
export type TooltipEvents = GetEventPropsFromEmits<typeof tooltipEmits>;
export type TooltipProps = Partial<TooltipSetupProps> & TooltipEvents;
