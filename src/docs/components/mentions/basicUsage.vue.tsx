import { options } from 'data';
import { ref } from 'vue';

const data = ref({
  value: 'test@value1 @value4 what',
});
export default () => (
  <>
    <l-mentions
      value={data.value.value}
      options={options}
      onUpdate={(e) => {
        data.value = e.detail;
        console.log('update', e.detail);
      }}
    ></l-mentions>
    <l-mentions value={data.value.value} options={options} readonly></l-mentions>
    <l-mentions value={data.value.value} options={options} disabled></l-mentions>
    <pre class="w-full">{data.value.value}</pre>
  </>
);
