import { ref } from 'vue';

const spinning = ref(true);
export default () => {
  return (
    <>
      <l-switch v-update-checked:checked={spinning.value} />
      <l-spin spinning={spinning.value} delay={200} />
    </>
  );
};
