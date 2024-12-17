import { tooltipEmits, tooltipProps, defineTooltip, TooltipProps, iTooltip } from '@lun-web/components';
import createComponent from '../createComponent';

export const LTooltip = createComponent<TooltipProps, iTooltip>('tooltip', defineTooltip, tooltipProps, tooltipEmits);
if (__DEV__) LTooltip.displayName = 'LTooltip';
