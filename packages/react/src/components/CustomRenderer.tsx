import { customRendererEmits, customRendererProps, defineCustomRenderer, CustomRendererProps, iCustomRenderer } from '@lun-web/components';
import createComponent from '../createComponent';

export const LCustomRenderer = createComponent<CustomRendererProps, iCustomRenderer>('custom-renderer', defineCustomRenderer, customRendererProps, customRendererEmits);
if (__DEV__) LCustomRenderer.displayName = 'LCustomRenderer';
