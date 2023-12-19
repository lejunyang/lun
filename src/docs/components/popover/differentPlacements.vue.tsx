export default function () {
  return (
    <div style="width: 100%">
      <div style="display: flex; justify-content: space-evenly;">
        <l-popover content="content" placement="top-start">
          <l-button>TS</l-button>
        </l-popover>
        <l-popover content="content" placement="top">
          <l-button>Top</l-button>
        </l-popover>
        <l-popover content="content" placement="top-end">
          <l-button>TE</l-button>
        </l-popover>
      </div>
      <div style="float: left; display: flex; flex-direction: column; gap: 5px;">
        <l-popover content="content" placement="left-start">
          <l-button>LS</l-button>
        </l-popover>
        <l-popover content="content" placement="left">
          <l-button>Left</l-button>
        </l-popover>
        <l-popover content="content" placement="left-end">
          <l-button>LE</l-button>
        </l-popover>
      </div>
      <div style="float: right; display: flex; flex-direction: column; gap: 5px;">
        <l-popover content="content" placement="right-start">
          <l-button>RS</l-button>
        </l-popover>
        <l-popover content="content" placement="right">
          <l-button>Right</l-button>
        </l-popover>
        <l-popover content="content" placement="right-end">
          <l-button>RE</l-button>
        </l-popover>
      </div>
      <div style="clear: both; display: flex; justify-content: space-evenly;">
        <l-popover content="content" placement="bottom-start">
          <l-button>BS</l-button>
        </l-popover>
        <l-popover content="content" placement="bottom">
          <l-button>Bottom</l-button>
        </l-popover>
        <l-popover content="content" placement="bottom-end">
          <l-button>BE</l-button>
        </l-popover>
      </div>
    </div>
  );
}
