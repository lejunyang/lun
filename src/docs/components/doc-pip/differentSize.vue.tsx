import { ref } from 'vue';

const open = ref(false),
  width = ref(200),
  height = ref(200);
export default () => (
  <>
    <l-doc-pip open={open.value} width={width.value} height={height.value}>
      <l-input type="number" v-update={width.value} label="width" labelType="float" />
      <l-input type="number" v-update={height.value} label="height" labelType="float" />
    </l-doc-pip>
    <l-button onClick={() => (open.value = !open.value)}>toggle Pip</l-button>
  </>
);
