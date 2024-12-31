import { ref } from 'vue';

const range = ref();
export default () => (
  <>
    <l-calendar v-update:value={range.value} range></l-calendar>
    <div> {JSON.stringify(range.value)}</div>
  </>
);
