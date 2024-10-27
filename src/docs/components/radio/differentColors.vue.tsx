import { themeColors } from '@lun-web/components';

export default function () {
  return themeColors.map((color) => <l-radio color={color} checked>{color}</l-radio>);
}
