import { sentence } from 'data';
import { ref } from 'vue';

const open = ref(false);
export default () => (
  <>
    <l-doc-pip open={open.value}>
      <l-callout message={sentence} />
    </l-doc-pip>
    <l-button onClick={() => (open.value = !open.value)}>toggle</l-button>
  </>
);
