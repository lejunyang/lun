import { ExtractPropTypes, PropType } from 'vue';
import { popoverProps } from '../popover/type';
import { CommonProps, createEmits, GetEventMapFromEmits, GetEventPropsFromEmits, OpenCloseEmits, openCloseEmits } from 'common';
import { freeze } from '@lun-web/utils';

export const tooltipProps = freeze({
  ...popoverProps,
  overflow: { type: String as PropType<'enable' | 'open'> },
});

export const tooltipEmits = createEmits<
  OpenCloseEmits & {
    overflowChange: { isOverflow: boolean; target: Element };
  }
>([...openCloseEmits, 'overflowChange']);

export type TooltipSetupProps = ExtractPropTypes<typeof tooltipProps> & CommonProps;
export type TooltipEventProps = GetEventPropsFromEmits<typeof tooltipEmits>;
export type TooltipEventMap = GetEventMapFromEmits<typeof tooltipEmits>;
export type TooltipProps = Partial<TooltipSetupProps> & TooltipEventProps;
