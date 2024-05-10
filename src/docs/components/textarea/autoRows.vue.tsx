import { text } from "data";

export default () => (
  <>
    <l-textarea autoRows />
    <l-textarea autoRows rows={3} placeholder="autoRows, rows=3" />
    <l-textarea autoRows rows={3} maxRows={5} placeholder="autoRows, rows=3, maxRows=5" />
    <l-textarea rows={3} placeholder="only rows=3" />
    <l-textarea autoRows maxRows={3} placeholder={text} />
  </>
);
