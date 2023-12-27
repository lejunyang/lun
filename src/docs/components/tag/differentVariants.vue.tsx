export default () => {
  return (
    <>
      <div class="container">
        <l-tag variant="solid">solid</l-tag>
        <l-tag variant="soft">soft</l-tag>
        <l-tag variant="outline">outline</l-tag>
        <l-tag variant="surface">surface</l-tag>
      </div>
      <div class="container">
        <l-tag variant="solid" removable tabindex="1">
          solid
        </l-tag>
        <l-tag variant="soft" removable tabindex="1">
          soft
        </l-tag>
        <l-tag variant="outline" removable tabindex="1">
          outline
        </l-tag>
        <l-tag variant="surface" removable tabindex="1">
          surface
        </l-tag>
      </div>
    </>
  );
}
