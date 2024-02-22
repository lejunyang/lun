import { text } from 'data';

export default () => (
  <l-watermark content="loading image failed" height={30} width={30} image="./ink.webp" opacity={0.2}>
    {text.repeat(5)}
  </l-watermark>
);
