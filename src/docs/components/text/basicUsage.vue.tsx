import { text } from "data";

export default () => (
  <>
    <l-text text={text}></l-text>
    <l-text as="code" text={text}></l-text>
  </>
);