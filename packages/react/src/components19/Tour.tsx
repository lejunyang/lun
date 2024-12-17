import { defineTour, TourProps, iTour } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LTour = createComponent<TourProps, iTour>('tour', defineTour);
if (__DEV__) LTour.displayName = 'LTour';
