import { defineDocPip, DocPipProps, iDocPip } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LDocPip = createComponent<DocPipProps, iDocPip>('doc-pip', defineDocPip);
if (__DEV__) LDocPip.displayName = 'LDocPip';
