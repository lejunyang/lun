export default () => (
  <l-scroll-view style="height: 300px; position: relative; width: 100%; overflow: auto;">
    <div slot="x-overflow" style="position: sticky; top: 0; left: 0">
      x is overflow
    </div>
    <div slot="y-overflow" style="position: sticky; top: 25px; left: 0px">
      y is overflow
    </div>
    <div slot="x-forward" style="position: sticky; top: 50px; left: 0px">
      scrolled in x forward
    </div>
    <div slot="x-backward" style="position: sticky; top: 50px; left: 0px">
      scrolled in x backward
    </div>
    <div slot="y-forward" style="position: sticky; top: 75px; left: 0px">
      scrolled in y forward
    </div>
    <div slot="y-backward" style="position: sticky; top: 75px; left: 0px">
      scrolled in y backward
    </div>
    <div style="height: 1000px; width: 1000px; background: var(--l-accent-a3);"></div>
  </l-scroll-view>
);
