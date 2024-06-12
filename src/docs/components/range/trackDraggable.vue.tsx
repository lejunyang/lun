import { ref } from 'vue';

const value1 = ref([20, 30, 50]),
  value2 = ref([10, 50]);
export default () => (
  <>
    <l-range v-update={value1.value} trackDraggable />
    <l-range v-update={value2.value} type="vertical" trackDraggable style="height: 200px" />
  </>
);
