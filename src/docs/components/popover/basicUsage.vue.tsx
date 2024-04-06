import { text } from 'data';

export default function () {
  return (
    <>
      <l-popover triggers="hover" content="悬浮触发弹出">
        <l-button tabindex="0">悬浮触发</l-button>
      </l-popover>
      <l-popover triggers="click" content="点击触发弹出">
        <l-button>点击触发</l-button>
      </l-popover>
      <l-popover triggers="click" toggleMode content="点击切换弹出">
        <l-button>点击切换</l-button>
      </l-popover>
      <l-popover triggers="focus" content="聚焦触发弹出">
        <l-button>聚焦触发</l-button>
      </l-popover>
      <l-popover triggers="edit" content="聚焦编辑触发弹出">
        <l-input placeholder="聚焦编辑触发" />
      </l-popover>
      <l-popover triggers="contextmenu" content="右键触发弹出">
        <l-button>右键触发</l-button>
      </l-popover>
      <l-popover triggers={['hover', 'click', 'focus', 'contextmenu', 'edit']}>
        <div slot="pop-content">
          <l-input value="value" />
          test
        </div>
        <l-button>多个触发方式</l-button>
      </l-popover>
      <l-popover triggers="select" content="选中文字触发">
        <div>选中文字触发：{text}</div>
      </l-popover>
    </>
  );
}
