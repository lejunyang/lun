export default function () {
  return (
    <>
      <div class="container">
        检查文字与按钮对齐x
        <l-button variant="ghost">
          <l-icon name="clear" />
        </l-button>
        <l-button variant="ghost">文字x</l-button>
        <l-button>
          <l-icon name="down" />
        </l-button>
        <l-button>
          <l-icon name="x" />
        </l-button>
      </div>
      <div class="container">
        <l-button variant="surface" hold="1000">surface</l-button>
        <l-button variant="solid" hold="1000">solid</l-button>
        <l-button variant="solid" hold="1000" highContrast>solid highContrast</l-button>
        <l-button variant="outline" hold="1000">outline</l-button>
        <l-button variant="soft" hold="1000">soft</l-button>
        <l-button variant="ghost" hold="1000">ghost</l-button>
      </div>
    </>
  );
}
