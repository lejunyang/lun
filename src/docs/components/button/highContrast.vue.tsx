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
        <l-button variant="surface" highContrast>
          surface
        </l-button>
        <l-button variant="solid" highContrast>
          solid
        </l-button>
        <l-button variant="outline" highContrast>
          outline
        </l-button>
        <l-button variant="soft" highContrast>
          soft
        </l-button>
        <l-button variant="ghost" highContrast>
          ghost
        </l-button>
      </div>
      <div class="container">
        <l-button variant="surface" highContrast disabled>
          surface
        </l-button>
        <l-button variant="solid" highContrast disabled>
          solid
        </l-button>
        <l-button variant="outline" highContrast disabled>
          outline
        </l-button>
        <l-button variant="soft" highContrast disabled>
          soft
        </l-button>
        <l-button variant="ghost" highContrast disabled>
          ghost
        </l-button>
      </div>
    </>
  );
}
