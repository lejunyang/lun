import { defineCustomRenderer, CustomRendererProps, iCustomRenderer } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LCustomRenderer = createComponent<CustomRendererProps, iCustomRenderer>('custom-renderer', defineCustomRenderer);
if (__DEV__) LCustomRenderer.displayName = 'LCustomRenderer';
