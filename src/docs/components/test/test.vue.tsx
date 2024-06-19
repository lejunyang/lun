import { ref } from 'vue';

const date = ref(),
  multiple = ref(),
  range = ref(),
  ranges = ref();

export default () => (
  <>
    <div class="w-full">
      <div>Single</div>
      <l-calendar v-update={date.value}></l-calendar>
      {JSON.stringify(date.value)}
    </div>
    <div class="w-full">
      <div>multiple</div>
      <l-calendar v-update={multiple.value} multiple></l-calendar>
      {JSON.stringify(multiple.value)}
    </div>
    <div class="w-full">
      <div>range</div>
      <l-calendar v-update={range.value} range></l-calendar>
      {JSON.stringify(range.value)}
    </div>
    <div class="w-full">
      <div>ranges</div>
      <l-calendar v-update={ranges.value} multiple range></l-calendar>
      {JSON.stringify(ranges.value)}
    </div>
  </>
);
