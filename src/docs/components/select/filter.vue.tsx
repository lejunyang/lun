import { optionsForSearch } from 'data';
import { ref } from 'vue';

const select = ref(null);
const multi = ref(null);
const input = ref(null);
export default () => {
  return (
    <>
      <l-select options={optionsForSearch} v-update:value={select.value} filter />
      <l-select
        options={optionsForSearch.map((i) => {
          if (!input.value) return i;
          return {
            ...i,
            content: i.label.split(input.value).join(`<span style="color: red;">${input.value}</span>`),
            contentPreferHtml: true,
          };
        })}
        multiple
        v-update:value={multi.value}
        filter
        onInputUpdate={(e) => {
          input.value = e.detail;
        }}
      />
    </>
  );
};
