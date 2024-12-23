import { text } from 'data';
import { ref } from 'vue';

const open = ref(false);
export default () => {
  return (
    <>
      <l-button onClick={() => (open.value = true)}>Open Dialog</l-button>
      <l-dialog v-update-open={open.value} customDraggable={(el) => el.id === 'custom'}>
        <div slot="header">
          <span id="custom" style="margin-rignht: 5px;font-size: 20px;cursor: move;font-weight: bold;">
            +
          </span>
          Drag
        </div>
        {text}
      </l-dialog>
    </>
  );
};
