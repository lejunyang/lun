import { ref } from 'vue';

const date = ref();
export default () => (
  <>
    <l-calendar v-update:value={date.value}></l-calendar>
    <div>{JSON.stringify(date.value)}</div>
  </>
);
