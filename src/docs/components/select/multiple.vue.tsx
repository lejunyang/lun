import { options } from "data"

export default () => {
  return (
    <>
      <l-select multiple options={options} />
      <l-select multiple options={options} hideOptionWhenSelected />
    </>
  );
}