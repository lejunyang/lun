import { createImportStyle } from '../../utils';
import style from './basic.scss?inline';

export * from './Popover';
export type { PopoverProps } from './type';
export const importPopoverStyle = createImportStyle('popover', style);
