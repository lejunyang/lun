import { watermarkEmits, watermarkProps, defineWatermark, WatermarkProps, iWatermark } from '@lun-web/components';
import createComponent from '../createComponent';

export const LWatermark = createComponent<WatermarkProps, iWatermark>('watermark', defineWatermark, watermarkProps, watermarkEmits);
if (__DEV__) LWatermark.displayName = 'LWatermark';
