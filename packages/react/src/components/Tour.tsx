
import { tourEmits, TourProps, tourProps, defineTour, iTour } from '@lun-web/components';
import createComponent from '../createComponent';

export const LTour = createComponent<TourProps, iTour>('tour', defineTour, tourProps, tourEmits);
if (__DEV__) LTour.displayName = 'LTour';