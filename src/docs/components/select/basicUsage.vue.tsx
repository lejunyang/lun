import { options } from "data"
import { ref } from "vue"

const select = ref("value1");
export default () => {
  return (
    <>
      <l-select options={options} v-update={select.value} />
      <l-select options={options} v-update={select.value} readonly />
      <l-select options={options} v-update={select.value} disabled />
    </>
  );
}