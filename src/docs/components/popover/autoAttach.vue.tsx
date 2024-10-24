export default () => (
  <l-popover autoAttachAttr="data-target">
    <l-button data-target="target1">button1</l-button>
    <l-button data-target="target2">button2</l-button>
    <div slot="target1">button1 pop content</div>
    <div slot="target2">button2 pop content</div>
    <div slot="pop-content">default content</div>
  </l-popover>
);
