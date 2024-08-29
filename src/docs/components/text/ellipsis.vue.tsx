import { text, chText } from 'data';

export default () => (
  <>
    <l-text text={text} ellipsis="right"></l-text>
    <l-text text={text} ellipsis="middle"></l-text>
    <l-text text={chText} ellipsis="middle"></l-text>
    <l-text text={text} ellipsis="left"></l-text>
  </>
);
