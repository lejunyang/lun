import { defineWatermark, WatermarkProps, iWatermark } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LWatermark = createComponent<WatermarkProps, iWatermark>('watermark', defineWatermark);
if (__DEV__) LWatermark.displayName = 'LWatermark';
