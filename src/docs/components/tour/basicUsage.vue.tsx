import { delay } from '@lun-web/utils';
import { sentence } from 'data';
import { ref } from 'vue';

const open = ref(),
  button = ref();
const steps = [
  { target: button, title: 'Step1', content: sentence },
  { target: '[href="/lun/components/theme-provider/"]', title: 'Theme', content: 'This is' },
  { title: 'Step3', content: 'No target ', beforeEnter: () => delay(2000) },
];
export default () => (
  <>
    <l-button onClick={() => (open.value = true)} ref={button}>
      Open
    </l-button>
    <l-tour v-update-open={open.value} steps={steps} onAfterClose={() => console.log('after closed')}></l-tour>
  </>
);
