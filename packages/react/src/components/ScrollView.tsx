
import { scrollViewEmits, ScrollViewProps, scrollViewProps, defineScrollView, iScrollView } from '@lun/components';
import createComponent from '../createComponent';

export const LScrollView = createComponent<ScrollViewProps, iScrollView>('scroll-view', defineScrollView, scrollViewProps, scrollViewEmits);
if (__DEV__) LScrollView.displayName = 'LScrollView';
