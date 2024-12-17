import { defineTag, TagProps, iTag } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LTag = createComponent<TagProps, iTag>('tag', defineTag);
if (__DEV__) LTag.displayName = 'LTag';
