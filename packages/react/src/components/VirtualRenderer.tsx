
import { virtualRendererEmits, VirtualRendererProps, virtualRendererProps, defineVirtualRenderer, iVirtualRenderer } from '@lun/components';
import createComponent from '../createComponent';

export const LVirtualRenderer = createComponent<VirtualRendererProps, iVirtualRenderer>('virtual-renderer', defineVirtualRenderer, virtualRendererProps, virtualRendererEmits);
if (__DEV__) LVirtualRenderer.displayName = 'LVirtualRenderer';
