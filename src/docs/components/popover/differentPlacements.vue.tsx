import { text } from 'data';

export default function () {
  const content = () => <div style="max-width: 200px;">{text}</div>;
  return (
    <div style="width: 100%">
      <div style="display: flex; justify-content: space-evenly;">
        <l-popover content={content} placement="top-start">
          <l-button>top-start</l-button>
        </l-popover>
        <l-popover content={content} placement="top">
          <l-button>top</l-button>
        </l-popover>
        <l-popover content={content} placement="top-end">
          <l-button>top-end</l-button>
        </l-popover>
      </div>
      <div style="float: left; display: flex; flex-direction: column; gap: 5px;">
        <l-popover content={content} placement="left-start">
          <l-button>left-start</l-button>
        </l-popover>
        <l-popover content={content} placement="left">
          <l-button>left</l-button>
        </l-popover>
        <l-popover content={content} placement="left-end">
          <l-button>left-end</l-button>
        </l-popover>
      </div>
      <div style="float: right; display: flex; flex-direction: column; gap: 5px;">
        <l-popover content={content} placement="right-start">
          <l-button>right-start</l-button>
        </l-popover>
        <l-popover content={content} placement="right">
          <l-button style="float: right">right</l-button>
        </l-popover>
        <l-popover content={content} placement="right-end">
          <l-button>right-end</l-button>
        </l-popover>
      </div>
      <div style="clear: both; display: flex; justify-content: space-evenly;">
        <l-popover content={content} placement="bottom-start">
          <l-button>bottom-start</l-button>
        </l-popover>
        <l-popover content={content} placement="bottom">
          <l-button>bottom</l-button>
        </l-popover>
        <l-popover content={content} placement="bottom-end">
          <l-button>bottom-end</l-button>
        </l-popover>
      </div>
    </div>
  );
}
