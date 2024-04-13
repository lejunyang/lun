
import { watermarkEmits, WatermarkProps, watermarkProps, defineWatermark, iWatermark } from '@lun/components';
import createComponent from '../createComponent';

export const LWatermark = createComponent<WatermarkProps, iWatermark>('watermark', defineWatermark, watermarkProps, watermarkEmits);
if (__DEV__) LWatermark.displayName = 'LWatermark';
