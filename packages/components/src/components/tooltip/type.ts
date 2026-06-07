import { ExtractPropTypes, PropType } from 'vue';
import { popoverProps } from '../popover/type';
import { CommonProps, createEmits, GetEventMapFromEmits, GetEventPropsFromEmits, OpenCloseEmits, openCloseEmits } from 'common';
import { freeze } from '@lun-web/utils';

export const tooltipProps = freeze({
  ...popoverProps,
  /**
   * @locale.zh-CN 内容溢出后的表现方式。open：溢出时始终展示 tooltip；enable：溢出时启用 tooltip，由 triggers 决定触发方式
   * @locale.en Behavior when content overflows. "open": always show the tooltip on overflow; "enable": enable the tooltip on overflow and let triggers decide when to show it
   */
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
