import { ref } from 'vue';

const multi = ref(['1', '2', '3']);

export default function () {
  return (
    <>
      <l-input
        multiple
        value={multi.value}
        placeholder="placeholder"
        onUpdate={(e) => {
          console.log('e', e);
          multi.value = e.detail;
        }}
      />
      disabled: <l-input multiple value={multi.value} disabled placeholder="placeholder" />
      readonly: <l-input multiple value={multi.value} readonly placeholder="placeholder" />
    </>
  );
}
