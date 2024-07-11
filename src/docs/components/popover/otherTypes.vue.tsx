export default () => (
  <>
    <l-popover type="normal" strategy="fixed">
      <l-button>normal + fixed实现</l-button>
      <l-popover slot="pop-content" type="normal" content="嵌套" strategy="fixed">
        <l-button>normal + fixed实现</l-button>
      </l-popover>
    </l-popover>
    <l-popover type="normal" strategy="absolute">
      <l-button>normal + absolute实现</l-button>
      <l-popover slot="pop-content" type="normal" content="嵌套" strategy="absolute" placement="right">
        <l-button>normal + absolute实现</l-button>
      </l-popover>
      <l-popover slot="pop-content" type="normal" content="嵌套" strategy="fixed" placement="right">
        <l-button>normal + fixed实现</l-button>
      </l-popover>
    </l-popover>
    <l-popover
      type="teleport"
      strategy="fixed"
      content={
        <l-popover type="teleport" content="嵌套" strategy="fixed">
          <l-button>teleport + fixed实现</l-button>
        </l-popover>
      }
    >
      <l-button>teleport + fixed实现</l-button>
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
