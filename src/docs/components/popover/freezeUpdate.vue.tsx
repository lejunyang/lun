import { ref } from 'vue';

const content = ref('initial'),
  content2 = ref('initial');
const onClose = () => {
  content.value = 'closing';
  setTimeout(() => (content.value = 'initial'), 200);
};
const onClose2 = () => {
  content2.value = 'closing';
  setTimeout(() => (content2.value = 'initial'), 200);
};
export default () => (
  <>
    <l-popover content={content.value} onClose={onClose}>
      <l-input />
    </l-popover>
    <l-popover content={content2.value} freezeWhenClosing onClose={onClose2}>
      <l-input placeholder="freezeWhenClosing" />
    </l-popover>
  </>
);
