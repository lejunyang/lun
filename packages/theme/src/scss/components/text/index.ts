import { createImportDynamicStyle, createImportStyle, getHostStyle } from '@lun/components';
import basic from './basic.scss?inline';
import { getVarValue } from '../../utils';

const importTextDynamic = createImportDynamicStyle('text', (vm, _name, _context) => {
  const size = vm.exposed?.size,
    lineHeight = getVarValue(['line', 'height', size]);
  const styles = [
    `font-size:` + getVarValue(['font', 'size', size]),
    `line-height:` + lineHeight,
    `letter-spacing:` + getVarValue(['letter', 'spacing', size]),
  ];
  if (vm.props.ellipsis === 'center') styles.push(`height:` + lineHeight);
  return size ? getHostStyle(styles) : '';
});
const importBasic = createImportStyle('text', basic);

export const importTextBasicTheme = () => {
  importBasic();
  importTextDynamic();
};
