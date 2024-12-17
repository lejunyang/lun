import { defineTooltip, TooltipProps, iTooltip } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LTooltip = createComponent<TooltipProps, iTooltip>('tooltip', defineTooltip);
if (__DEV__) LTooltip.displayName = 'LTooltip';
