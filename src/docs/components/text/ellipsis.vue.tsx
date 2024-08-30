import { text, chText } from 'data';

export default () => (
  <>
    end:
    <l-text text={text} ellipsis></l-text>
    <br />
    center:
    <l-text text={text} ellipsis="center" style="word-break: break-all"></l-text>
    <l-text text={chText} ellipsis="center"></l-text>
    <br />
    start:
    <l-text text={text} ellipsis="start"></l-text>
  </>
);
