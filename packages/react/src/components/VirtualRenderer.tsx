import { virtualRendererEmits, virtualRendererProps, defineVirtualRenderer, VirtualRendererProps, iVirtualRenderer } from '@lun-web/components';
import createComponent from '../createComponent';

export const LVirtualRenderer = createComponent<VirtualRendererProps, iVirtualRenderer>('virtual-renderer', defineVirtualRenderer, virtualRendererProps, virtualRendererEmits);
if (__DEV__) LVirtualRenderer.displayName = 'LVirtualRenderer';
