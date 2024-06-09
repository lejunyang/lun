import { text } from 'data';
import { ref } from 'vue';

const open = ref(false),
  nested = ref(false);
export default () => {
  return (
    <div class="container" style="transform: translate(0, 0);width: 100%;height: 300px; overflow: auto">
      <div class="container center" style="height: 500px">
        <l-button onClick={() => (open.value = true)}>Open Dialog</l-button>
        <l-dialog v-update-open={open.value} noTopLayer>
          {text} <l-button onClick={() => (nested.value = true)}>Open Nested</l-button>
          <l-dialog v-update-open={nested.value} noTopLayer>
            Nested {text}
          </l-dialog>
        </l-dialog>
      </div>
    </div>
  );
};
