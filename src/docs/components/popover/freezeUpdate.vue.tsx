import { ref } from 'vue';

const content = ref('initial');
const onClose = () => {
  content.value = 'closing';
  setTimeout(() => (content.value = 'initial'), 200);
};
export default () => (
  <>
    <l-popover content={content.value} onClose={onClose}>
      <l-input />
    </l-popover>
    <l-popover content={content.value} freezeWhenClosing onClose={onClose}>
      <l-input placeholder="freezeWhenClosing" />
    </l-popover>
  </>
);
