export default () => (
  <>
    <l-popover class="w-full" triggers={['click', 'contextmenu']} pointerTarget="coord" content="menu">
      <div style="height: 200px; background-color: var(--l-accent-a3); text-align: center; line-height: 200px;">
        单击或右键
      </div>
    </l-popover>
  </>
);
