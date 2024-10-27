import { isFunction } from '@lun-web/utils';

export const hasRect = (target?: any) => isFunction(target?.getBoundingClientRect);
