import { defineCallout, CalloutProps, iCallout } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LCallout = createComponent<CalloutProps, iCallout>('callout', defineCallout);
if (__DEV__) LCallout.displayName = 'LCallout';
