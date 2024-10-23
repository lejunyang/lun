import { text } from "data";
import { ref } from "vue";

const multiple = ref(false)
export default () => (
  <>
    允许同时多个打开：<l-switch v-update-checked:checked={multiple.value} />
    <l-accordion-group allowMultiple={multiple.value}>
      <l-accordion header="accordion-1" content={text}></l-accordion>
      <l-accordion header="accordion-2" content={text}></l-accordion>
      <l-accordion header="accordion-3" content={text}></l-accordion>
    </l-accordion-group>
  </>
);