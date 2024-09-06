import { text } from 'data';

export default () => (
  <>
    <l-text as="blockquote" text={text}></l-text>
    <l-text as="blockquote" text={text} color="amber"></l-text>
    <l-text as="blockquote" text={text} color="red" grayColor="sage"></l-text>
  </>
);
