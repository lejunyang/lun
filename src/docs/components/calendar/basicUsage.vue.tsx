import { ref } from 'vue';

const date = ref(),
  multiple = ref(),
  range = ref(),
  ranges = ref();
const c = 'w-full container column';
export default () => (
  <>
    <div class={c}>
      <b>Single</b>
      {JSON.stringify(date.value)}
      <l-calendar v-update:value={date.value}></l-calendar>
    </div>
    <div class={c}>
      <b>multiple</b>
      {JSON.stringify(multiple.value)}
      <l-calendar v-update:value={multiple.value} multiple></l-calendar>
    </div>
    <div class={c}>
      <b>range</b>
      {JSON.stringify(range.value)}
      <l-calendar v-update:value={range.value} range></l-calendar>
    </div>
    <div class={c}>
      <b>ranges</b>
      {JSON.stringify(ranges.value)}
      <l-calendar v-update:value={ranges.value} multiple range></l-calendar>
    </div>
  </>
);
