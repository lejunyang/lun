import { ref } from "vue";

const text = ref();
export default function () {
  return (
    <>
      <l-textarea showClearIcon v-update={text.value} />
      <l-textarea showClearIcon readonly v-update={text.value} />
      <l-textarea showClearIcon disabled v-update={text.value} />
    </>
  );
}
