import { themeColors } from '@lun/components';
import { options } from 'data';
export default () => {
  return (
    <>
      {themeColors.slice(0, 3).map((color) => (
        <l-select color={color} options={options} placeholder={color} />
      ))}
      {themeColors.slice(-3).map((color) => (
        <l-select color={color} options={options} multiple placeholder={color} />
      ))}
    </>
  );
};
