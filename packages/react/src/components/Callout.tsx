
import { calloutEmits, CalloutProps, calloutProps, defineCallout, iCallout } from '@lun/components';
import createComponent from '../createComponent';

export const LCallout = createComponent<CalloutProps, iCallout>('callout', defineCallout, calloutProps, calloutEmits);
if (__DEV__) LCallout.displayName = 'LCallout';
