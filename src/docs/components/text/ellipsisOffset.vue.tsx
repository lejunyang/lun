import { text, chText } from 'data';

export default () => (
  <>
    <l-text text={text} ellipsis ellipsisOffset={5}></l-text>
    <l-text text={chText} ellipsis ellipsisOffset={5}></l-text>
    <l-text text={chText} ellipsis="start" ellipsisOffset={5}></l-text>
  </>
);
