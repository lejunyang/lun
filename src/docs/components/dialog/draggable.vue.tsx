import { text } from 'data';
import { ref } from 'vue';

const open = ref(false);
export default () => {
  return (
    <>
      <l-button onClick={() => (open.value = true)}>Open Dialog</l-button>
      <l-dialog v-update-open={open.value} header="Drag the left '+'" customDraggable={(el) => el.id === 'custom'}>
        <span slot="header-start" id="custom" style="margin-right: 5px;font-size: 20px;cursor: move;font-weight: bold;">
          +
        </span>
        {text}
      </l-dialog>
    </>
  );
};
