export default () => (
  <l-scroll-view style="height: 300px; position: relative; width: 100%; overflow: auto;">
    <div style="position: sticky; top: 0; height: 20px; left: 0px; width: calc(100% * var(--scroll-x-percent)); background: var(--l-accent-a5);"></div>
    <div style="height: 1000px; width: 1000px; background: var(--l-accent-a3);"></div>
  </l-scroll-view>
);
