export default () => (
  <>
    <l-popover type="position" strategy="fixed">
      <l-button>position + fixed实现</l-button>
      <l-popover slot="pop-content" type="position" content="嵌套" strategy="fixed">
        <l-button>position + fixed实现</l-button>
      </l-popover>
    </l-popover>
    <l-popover type="position" strategy="absolute" placement="right">
      <l-button>position + absolute实现</l-button>
      <l-popover slot="pop-content" type="position" content="嵌套" strategy="absolute" placement="right">
        <l-button>position + absolute实现</l-button>
      </l-popover>
      <l-popover slot="pop-content" type="position" content="嵌套" strategy="fixed" placement="right">
        <l-button>position + fixed实现</l-button>
      </l-popover>
    </l-popover>
    <l-popover type="teleport" strategy="fixed">
      <l-button>teleport + fixed实现</l-button>
      <l-popover slot="pop-content" type="teleport" content="嵌套" strategy="fixed">
        <l-button>teleport + fixed实现</l-button>
      </l-popover>
    </l-popover>
    <l-popover
      type="teleport"
      content={
        <l-popover type="teleport" content="嵌套" strategy="absolute">
          <l-button>teleport + absolute实现</l-button>
        </l-popover>
      }
      strategy="absolute"
    >
      <l-button>teleport + absolute实现</l-button>
    </l-popover>
  </>
);
