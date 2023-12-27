import { themeColors } from '@lun/components';

export default () =>
  themeColors.map((color) => (
    <l-tag key={color} color={color}>
      {color}
    </l-tag>
  ));
