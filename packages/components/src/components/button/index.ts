import { createImportStyle } from '../../utils';
import styles from './basic.scss?inline';

export * from './Button';
export * from './type';
export const importButtonStyle = createImportStyle('button', styles);