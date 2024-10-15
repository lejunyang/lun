import { computed, ref } from 'vue';

const target = ref(),
  progress = ref('0.00%'),
  rangeStart = ref('cover'),
  rangeEnd = ref('cover'),
  option = computed(() => ({
    target,
    progressVarName: '--target-progress',
    range: [rangeStart.value, rangeEnd.value],
    onUpdate(num) {
      progress.value = (num * 100).toFixed(2) + '%';
    },
  })),
  selectOptions = ['cover', 'contain', 'entry', 'exit'];
export default () => (
  <>
    <l-select v-update={rangeStart.value} options={selectOptions} />
    <l-select v-update={rangeEnd.value} options={selectOptions} />
    <l-scroll-view style="height: 300px; position: relative; width: 100%; " observeView={option.value}>
      <div
        style={
          'position:sticky;top:0;left:100%;width:20px;height:calc(100% * var(--target-progress));background:var(--l-accent-a5);writing-mode:tb;'
        }
      >
        {progress.value}
      </div>
      <div class="w-full" style="height: 1000px;"></div>
      <div
        ref={target}
        style="position: absolute; background: var(--l-accent-a5); width: 100px; height: 50px; top: 500px; left: 0; transform: scaleX(calc(1 + var(--target-progress))"
      ></div>
    </l-scroll-view>
  </>
);
