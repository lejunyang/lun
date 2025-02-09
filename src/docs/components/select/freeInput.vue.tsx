import { options } from 'data';
import { ref } from 'vue';

const select = ref(null);
const multi = ref(['value1']);
export default () => {
  return (
    <>
      <l-select options={options} v-update:value={select.value} freeInput />
      <l-select multiple options={options} freeInput v-update:value={multi.value} />
    </>
  );
};
