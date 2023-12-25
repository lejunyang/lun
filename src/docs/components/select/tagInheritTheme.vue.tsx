import { optionsWithColors, groupOptionsWithColors } from 'data';
import { ref } from 'vue';

const select = ref(
  Array(5)
    .fill(1)
    .map((_, i) => `value${i + 1}`),
);
export default () => {
  return (
    <>
      <l-select options={optionsWithColors} multiple v-update={select.value} />
      <l-select options={groupOptionsWithColors} multiple v-update={select.value} />
    </>
  );
};
