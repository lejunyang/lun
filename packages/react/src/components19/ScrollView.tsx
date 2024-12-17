import { defineScrollView, ScrollViewProps, iScrollView } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LScrollView = createComponent<ScrollViewProps, iScrollView>('scroll-view', defineScrollView);
if (__DEV__) LScrollView.displayName = 'LScrollView';
