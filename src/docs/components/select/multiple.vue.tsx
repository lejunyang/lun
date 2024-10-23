import { options } from 'data';
import { ref } from 'vue';

const select = ref(['value1']);
export default () => {
  return (
    <>
      <l-select multiple options={options} v-update:value={select.value} />
      <l-select multiple options={options} hideOptionWhenSelected v-update:value={select.value} />
    </>
  );
};
