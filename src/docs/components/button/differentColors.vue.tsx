import { themeColors } from '@lun/components';

export default function () {
  return themeColors.map((color) => <l-button color={color}>{color}</l-button>);
}
