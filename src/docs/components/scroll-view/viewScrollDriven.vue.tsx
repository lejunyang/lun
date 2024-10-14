import { ref } from 'vue';

const target = ref(),
  progress = ref('0.00%'),
  option = [
    {
      target,
      progressVarName: '--target-progress',
      onUpdate(num) {
        progress.value = (num * 100).toFixed(2) + '%';
      },
    },
  ];
export default () => (
  <l-scroll-view
    style="height: 300px; position: relative; width: 100%; "
    observeView={option}
  >
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
);
