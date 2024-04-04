import { ref } from 'vue';

const targets = ref([{ value: '' }]);
const color = {
  attached: 'green',
  detached: 'red',
};
const get = (id) => document.getElementById(id) as any;
export default () => (
  <>
    {targets.value.map((t, i) => (
      <div class="w-full container">
        <l-button color={color[t.value]} id={`target` + i}>
          target {i} {t.value}
        </l-button>
        <l-button onClick={() => ((t.value = 'attached'), get('pop-extra')?.attachTarget(get(`target` + i)))}>
          attach
        </l-button>
        <l-button onClick={() => ((t.value = 'detached'), get('pop-extra')?.detachTarget(get(`target` + i)))}>
          detach
        </l-button>
      </div>
    ))}
    <div class="w-full">
      <l-popover id="pop-extra">
        <l-button onClick={() => targets.value.push({ value: '' })}>add target</l-button>
        <div slot="pop-content">pop content</div>
      </l-popover>
    </div>
  </>
);
