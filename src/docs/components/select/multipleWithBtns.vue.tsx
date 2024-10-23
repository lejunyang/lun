import { options } from 'data';
import { ref } from 'vue';

const select = ref(['value1']);
export default () => {
  return (
    <>
      <l-select multiple options={options} v-update:value={select.value} commonButtons />
      <l-select
        multiple
        options={options}
        v-update:value={select.value}
        color="red"
        commonButtons={{
          selectAll: false,
          reverse: { variant: 'ghost', color: 'green', onClick: () => console.log('clear') },
          clear: true,
        }}
      />
    </>
  );
};
