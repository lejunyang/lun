import { sentence } from 'data';
import { ref } from 'vue';

const flip = ref(),
  shift = ref();
export default () => (
  <>
    <div>
      flip: <l-switch v-update-checked:checked={flip.value} />
    </div>
    <div>
      shift:
      <l-switch v-update-checked:checked={shift.value} />
    </div>
    <div class="w-full" style="height: 200px; overflow: auto;">
      <div style="width: 1000px; height: 500px; position: relative; background-color: var(--l-gray-3);">
        <l-popover
          style="position: absolute; top: 140px; left: 100px;"
          open
          type='normal'
          flip={flip.value}
          shift={shift.value}
        >
          pop
          <div slot="pop-content">{sentence}</div>
        </l-popover>
      </div>
    </div>
  </>
);
