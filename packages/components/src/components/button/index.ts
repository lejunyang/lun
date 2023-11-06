import { createImportStyle } from '../../utils';
import styles from './basic.scss?inline';

export * from './Button';
export type { ButtonProps } from './type';
export const importButtonStyle = createImportStyle('button', styles);