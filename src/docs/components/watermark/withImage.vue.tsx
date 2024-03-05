import { text } from 'data';

export default () => (
  <l-watermark
    content="loading image failed"
    image="/lun/ink.webp"
    imageProps={{ opacity: 0.2, height: 30, width: 30 }}
  >
    {text.repeat(5)}
  </l-watermark>
);
