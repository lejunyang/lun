import { sentence, text } from 'data';

export default () => (
  <>
    <l-callout message={sentence} size="1" />
    <l-callout message={sentence} description={text} size="1" />
    <l-callout message={sentence} size="2" />
    <l-callout message={sentence} description={text} size="2" />
    <l-callout message={sentence} size="3" />
    <l-callout message={sentence} description={text} size="3" />
  </>
);
