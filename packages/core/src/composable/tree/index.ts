import { isEmpty } from '@lun-web/utils';
import { useSelectMethods, UseSelectOptions } from '../select';
import { unrefOrGet } from '../../utils/ref';

export const useExpandMethods = (options: UseSelectOptions & { defaultExpandAll?: boolean }) => {
  let updated = 0;
  const originalOnchange = options.onChange;
  options.onChange = (param) => {
    updated = 1;
    originalOnchange(param);
  };
  const result = useSelectMethods(options);
  return {
    /** @private used to get raw format model */
    _: result._,
    isExpanded: (val: any): boolean => {
      if (options.defaultExpandAll && !updated && isEmpty(unrefOrGet(options.current))) return true;
      return result.isSelected(val);
    },
    expandAll: result.selectAll,
    collapseAll: result.unselectAll,
    toggleExpand: result.toggle,
    reverseExpand: result.reverse,
    expand: result.select,
    collapse: result.unselect,
  };
};
