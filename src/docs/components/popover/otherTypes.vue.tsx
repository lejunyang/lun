export default () => (
  <>
    <l-popover type="fixed">
      <div slot="pop-content">fixed实现</div>
      <l-button>fixed实现</l-button>
    </l-popover>
    <l-popover type="teleport" content="teleport fixed实现">
      <l-button>teleport fixed实现</l-button>
    </l-popover>
  </>
);
