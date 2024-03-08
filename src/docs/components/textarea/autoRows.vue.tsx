import { text } from "data";

export default () => (
  <>
    <l-textarea autoRows />
    <l-textarea autoRows rows={3} placeholder="rows=3" />
    <l-textarea autoRows rows={3} maxRows={5} placeholder="rows=3, maxRows=5" />
    <l-textarea autoRows maxRows={3} placeholder={text} />
  </>
);
