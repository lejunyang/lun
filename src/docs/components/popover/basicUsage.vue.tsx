export default function () {
  return (
    <>
      <l-popover triggers="hover">
        <div slot="pop-content">悬浮触发弹出</div>
        <l-button>悬浮触发</l-button>
      </l-popover>
      <l-popover triggers="click">
        <div slot="pop-content">点击触发弹出</div>
        <l-button>点击触发</l-button>
      </l-popover>
      <l-popover triggers="focus">
        <div slot="pop-content">聚焦触发弹出</div>
        <l-button>聚焦触发</l-button>
      </l-popover>
      <l-popover triggers="contextmenu">
        <div slot="pop-content">右键触发弹出</div>
        <l-button>右键触发</l-button>
      </l-popover>
      <l-popover triggers={['hover', 'click', 'focus', 'contextmenu']}>
        <div slot="pop-content">弹出</div>
        <l-button>所有触发方式</l-button>
      </l-popover>
    </>
  );
}
