import { text } from 'data';

export default () => (
  <>
    <l-text text={text}></l-text>
    <l-text as="code">{text}</l-text>
    <l-text as="link" href="#" text={text}></l-text>
    <l-text as="blockquote" text={text}></l-text>
  </>
);
