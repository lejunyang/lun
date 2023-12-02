import { themeColors } from '@lun/components';

export default function () {
  return themeColors.map((color) => <l-radio color={color} checked>{color}</l-radio>);
}
