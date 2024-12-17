import { docPipEmits, docPipProps, defineDocPip, DocPipProps, iDocPip } from '@lun-web/components';
import createComponent from '../createComponent';

export const LDocPip = createComponent<DocPipProps, iDocPip>('doc-pip', defineDocPip, docPipProps, docPipEmits);
if (__DEV__) LDocPip.displayName = 'LDocPip';
