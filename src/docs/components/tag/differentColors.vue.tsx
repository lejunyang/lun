import { themeColors } from '@lun-web/components';

export default () =>
  themeColors.map((color) => (
    <l-tag key={color} color={color}>
      {color}
    </l-tag>
  ));
