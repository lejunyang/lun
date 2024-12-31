import { ref } from 'vue';

const ranges = ref();
export default () => (
  <>
    <l-calendar v-update:value={ranges.value} multiple range></l-calendar>
    <div> {JSON.stringify(ranges.value)}</div>
  </>
);
