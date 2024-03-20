import { options } from "data";

export default () => (
  <>
    <l-mentions value="test@me what" options={options}></l-mentions>
    <l-mentions value="test@me what" options={options} readonly></l-mentions>
    <l-mentions value="test@me what" options={options} disabled></l-mentions>
  </>
);
