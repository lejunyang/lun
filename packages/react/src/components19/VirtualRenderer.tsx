import { defineVirtualRenderer, VirtualRendererProps, iVirtualRenderer } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LVirtualRenderer = createComponent<VirtualRendererProps, iVirtualRenderer>('virtual-renderer', defineVirtualRenderer);
if (__DEV__) LVirtualRenderer.displayName = 'LVirtualRenderer';
