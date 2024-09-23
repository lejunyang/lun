import { text, chText } from 'data';

export default () => (
  <>
    end:
    <l-text text={text} ellipsis></l-text>
    <br />
    center:
    <l-text text={text} ellipsis="center"></l-text>
    <l-text text={chText} ellipsis="center"></l-text>
    <br />
    start:
    <l-text text={text} ellipsis="start"></l-text>
  </>
);
