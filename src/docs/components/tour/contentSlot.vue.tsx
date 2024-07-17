import { sentence } from 'data';
import { ref } from 'vue';

const open = ref(),
  button = ref();
const steps = [
  { target: button, title: 'Step1', content: sentence },
  { target: '[href="/lun/components/theme-provider/"]', title: 'Step2' },
];
export default () => (
  <>
    <l-button onClick={() => (open.value = true)} ref={button}>
      Open
    </l-button>
    <l-tour v-update-open={open.value} steps={steps}>
      <div slot="0">
        <p>Step 0 content</p>
        <l-callout message={sentence} />
      </div>
      <div slot="1">Step 1 content</div>
    </l-tour>
  </>
);
