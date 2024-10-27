import { createImportDynamicStyle, createImportStyle, getHostStyle } from '@lun-web/components';
import basic from './basic.scss?inline';
import outline from './outline.scss?inline';
import soft from './soft.scss?inline';
import solid from './solid.scss?inline';
import surface from './surface.scss?inline';
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

export const importTextSurfaceTheme = createImportStyle('text', surface, 'surface');
export const importTextSoftTheme = createImportStyle('text', soft, 'soft');
export const importTextOutlineTheme = createImportStyle('text', outline, 'outline');
export const importTextSolidTheme = createImportStyle('text', solid, 'solid');