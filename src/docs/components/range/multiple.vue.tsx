import { ref } from 'vue';

const value1 = ref([10, 50]),
  value2 = ref([20, 60, 80]);
export default () => (
  <>
    <l-range v-update={value1.value} />
    <l-range v-update={value2.value} />
  </>
);
