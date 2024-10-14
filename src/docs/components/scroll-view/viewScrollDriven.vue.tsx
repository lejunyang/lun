import { ref } from 'vue';

const target = ref();
export default () => (
  <l-scroll-view
    style="height: 300px; position: relative; width: 100%; "
    innerStyle="::slotted(.target)::before {content: var(--target-progress)} ::slotted(.target){color: red}"
    observeView={{
      target,
      progressVarName: '--target-progress',
    }}
  >
    <div
      style={
        'position:sticky;top:0;left:100%;width:20px;height:calc(100% * var(--target-progress));background:var(--l-accent-a5);'
      }
    ></div>
    <div class="w-full" style="height: 1000px;"></div>
    <div
      ref={target}
      style="position: absolute; background: var(--l-accent-a5); width: 100px; height: 50px; top: 500px; left: 0;"
    ></div>
  </l-scroll-view>
);
