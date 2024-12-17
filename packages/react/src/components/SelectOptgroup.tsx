import { selectOptgroupEmits, selectOptgroupProps, defineSelectOptgroup, SelectOptgroupProps, iSelectOptgroup } from '@lun-web/components';
import createComponent from '../createComponent';

export const LSelectOptgroup = createComponent<SelectOptgroupProps, iSelectOptgroup>('select-optgroup', defineSelectOptgroup, selectOptgroupProps, selectOptgroupEmits);
if (__DEV__) LSelectOptgroup.displayName = 'LSelectOptgroup';
