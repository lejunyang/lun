export default function () {
  return (
    <>
      <div class="container">
        <l-button variant="surface">surface</l-button>
        <l-button variant="solid">solid</l-button>
        <l-button variant="outline">outline</l-button>
        <l-button variant="soft">soft</l-button>
        <l-button variant="ghost">ghost</l-button>
      </div>
      <div class="container">
        <l-button variant="surface" disabled>
          surface
        </l-button>
        <l-button variant="solid" disabled>
          solid
        </l-button>
        <l-button variant="outline" disabled>
          outline
        </l-button>
        <l-button variant="soft" disabled>
          soft
        </l-button>
        <l-button variant="ghost" disabled>
          ghost
        </l-button>
      </div>
    </>
  );
}
