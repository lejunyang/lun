export default () => (
  <>
    <l-theme-provider loading color="grass">
      <l-popover type="teleport" content={<l-button slot="pop-content">弹出</l-button>}>
        <l-button>悬浮</l-button>
      </l-popover>
    </l-theme-provider>
  </>
);
