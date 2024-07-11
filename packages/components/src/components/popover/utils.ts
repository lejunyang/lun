import { isFunction } from '@lun/utils';

export const hasRect = (target?: any) => isFunction(target?.getBoundingClientRect);
