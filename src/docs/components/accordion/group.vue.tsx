import { text } from "data";

export default () => (
  <l-accordion-group>
    <l-accordion header="accordion-1" content={text}></l-accordion>
    <l-accordion header="accordion-2" content={text}></l-accordion>
    <l-accordion header="accordion-2" content={text}></l-accordion>
  </l-accordion-group>
);