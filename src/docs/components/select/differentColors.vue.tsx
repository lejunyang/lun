import { themeColors } from '@lun-web/components';
import { options } from 'data';
import { ref } from 'vue';

const select = ref('value1');
const mulSelect = ref(['value1']);
export default () => {
  return (
    <>
      {themeColors.slice(0, 3).map((color) => (
        <l-select color={color} options={options} placeholder={color} v-update:value={select.value} />
      ))}
      {themeColors.slice(-3).map((color) => (
        <l-select color={color} options={options} multiple placeholder={color} v-update:value={mulSelect.value} />
      ))}
    </>
  );
};
