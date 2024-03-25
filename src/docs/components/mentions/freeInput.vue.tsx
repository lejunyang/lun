import { ref } from 'vue';

const value = ref();
export default () => (
  <>
    <l-mentions v-update:value={value.value} noOptions triggers={['@', '#']}></l-mentions>
    <pre>{value.value}</pre>
  </>
);
