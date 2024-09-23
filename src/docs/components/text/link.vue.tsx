import { text } from 'data';

const href = '#';
export default () => (
  <>
    <l-text as="link" href={href} text={text}></l-text>
    <l-text as="link" href={href} text={text} disabled></l-text>
    <l-text as="link" href={href} text={text} color="cyan"></l-text>
    <l-text as="link" text={text} ellipsis color="pink"></l-text>
    <l-text as="link" text={text} ellipsis="start" color="pink"></l-text>
    <l-text as="link" text={text} ellipsis="center" color="purple"></l-text>
  </>
);
