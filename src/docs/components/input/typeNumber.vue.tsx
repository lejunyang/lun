export default () => {
  return (
    <>
      <div class="container">
        <l-input type="number" stepControl="up-down" />
        <l-input type="number" disabled stepControl="up-down" />
      </div>
      <div class="container">
        <l-input type="number" stepControl="plus-minus" />
        <l-input type="number" disabled stepControl="plus-minus" />
      </div>
    </>
  );
};
