
import { tagEmits, TagProps, tagProps, defineTag, iTag } from '@lun/components';
import createComponent from '../createComponent';

export const LTag = createComponent<TagProps, iTag>('tag', defineTag, tagProps, tagEmits);
if (__DEV__) LTag.displayName = 'LTag';
