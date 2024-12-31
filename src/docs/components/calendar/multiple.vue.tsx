import { ref } from 'vue';

const multiple = ref();
export default () => (
  <>
    <l-calendar v-update:value={multiple.value} multiple></l-calendar>
    <div>{JSON.stringify(multiple.value)}</div>
  </>
);
