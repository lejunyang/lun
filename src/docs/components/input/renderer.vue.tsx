import { ref } from 'vue';

const input = ref('value');
export default () => {
  return (
    <>
      <l-input v-update={input.value}>
        <div slot="renderer">{input.value?.[0]}***</div>
      </l-input>
      <l-input v-update={input.value} variant="soft">
        <div slot="renderer">{input.value?.[0]}***</div>
      </l-input>
    </>
  );
};
