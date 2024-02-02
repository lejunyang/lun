import { sentence, text } from 'data';

export default () => (
  <>
    <l-callout message={sentence} />
    <l-callout message={sentence} description={text} />
  </>
);
