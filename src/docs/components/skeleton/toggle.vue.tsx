import { text } from 'data';
import { ref } from 'vue';

const loading = ref(true);
export default () => (
  <>
    <l-switch v-update-checked:checked={loading.value}></l-switch>
    <l-skeleton loading={loading.value}>{text}</l-skeleton>
    <l-skeleton loading={loading.value} loadTransition="height">
      {text}
    </l-skeleton>
  </>
);
