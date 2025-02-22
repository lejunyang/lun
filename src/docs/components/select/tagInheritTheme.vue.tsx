import { arrayFrom } from '@lun-web/utils';
import { optionsWithColors, groupOptionsWithColors } from 'data';
import { ref } from 'vue';

const select = ref(arrayFrom(5, (_, i) => `value${i + 1}`));
export default () => {
  return (
    <>
      <l-select options={optionsWithColors} multiple v-update:value={select.value} />
      <l-select options={groupOptionsWithColors} multiple v-update:value={select.value} />
    </>
  );
};
