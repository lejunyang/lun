import { text } from 'data';
import { ref } from 'vue';

const open = ref(false);
export default () => {
  return (
    <div class="container" style="transform: translate(0, 0);width: 100%;height: 300px">
      <div class="container center" style="height: 500px">
        <l-button onClick={() => (open.value = true)}>Open Dialog</l-button>
        <l-dialog v-update-open={open.value} noTopLayer>
          {text}
        </l-dialog>
      </div>
    </div>
  );
};
