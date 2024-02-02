import { sentence, text } from 'data';

export default () => (
  <>
    <l-callout message={sentence} removable />
    <l-callout message={sentence} description={text} removable />
  </>
);
