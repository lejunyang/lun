
import { tooltipEmits, TooltipProps, tooltipProps, defineTooltip, iTooltip } from '@lun/components';
import createComponent from '../createComponent';

export const LTooltip = createComponent<TooltipProps, iTooltip>('tooltip', defineTooltip, tooltipProps, tooltipEmits);
if (__DEV__) LTooltip.displayName = 'LTooltip';
