import { tagEmits, tagProps, defineTag, TagProps, iTag } from '@lun-web/components';
import createComponent from '../createComponent';

export const LTag = createComponent<TagProps, iTag>('tag', defineTag, tagProps, tagEmits);
if (__DEV__) LTag.displayName = 'LTag';
