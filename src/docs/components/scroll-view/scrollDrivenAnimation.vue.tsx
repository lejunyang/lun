const common = 'display:flex;justify-content:center;position:sticky;top:0;left:0;';
export default () => (
  <l-scroll-view style="height: 300px; position: relative; width: 100%;">
    <div
      style={
        common +
        'height: 20px;width:calc(100% * var(--scroll-x-progress));background:linear-gradient(to right,var(--l-indigo-a5) calc(100% * var(--scroll-x-progress)),var(--l-plum-a5));font-size:calc(var(--scroll-x-progress) * 24px);'
      }
    >
      horizontal
    </div>
    <div
      style={
        common +
        'width: 20px;height:calc(100% * var(--scroll-y-progress));writing-mode:tb;background:linear-gradient(to bottom,var(--l-indigo-a5) calc(100% * var(--scroll-y-progress)),var(--l-plum-a5));font-size:calc(var(--scroll-y-progress) * 24px);'
      }
    >
      vertical
    </div>
    <div style="height: 1000px; width: 1000px; background: var(--l-accent-a3);"></div>
  </l-scroll-view>
);
