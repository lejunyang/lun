import { ref } from 'vue';

const multi = ref(['1', '2', '3']);

export default function () {
  return (
    <l-input
      multiple
      value={multi.value}
      onUpdate={(e) => {
        console.log('e', e);
        multi.value = e.detail;
      }}
    />
  );
}
