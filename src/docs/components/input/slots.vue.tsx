export default () => {
  return (
    <>
      <l-input value="value">
        <div slot="prepend">prepend</div>
        <div slot="prefix">prefix</div>
        <div slot="suffix">suffix</div>
        <div slot="append">append</div>
      </l-input>
      <l-input variant="soft" value="value">
        <div slot="prepend">prepend</div>
        <div slot="prefix">prefix</div>
        <div slot="suffix">suffix</div>
        <div slot="append">append</div>
      </l-input>
    </>
  );
};
