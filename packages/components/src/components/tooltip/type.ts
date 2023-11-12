import { ExtractPropTypes } from 'vue';
import { popoverProps } from '../popover/type';

export const tooltipProps = {
  ...popoverProps,
  overflowOnly: { type: Boolean },
};

export type TooltipProps = ExtractPropTypes<typeof tooltipProps>;

declare module 'vue' {
  export interface IntrinsicElementAttributes {
    'l-tooltip': TooltipProps & HTMLAttributes;
  }
}
