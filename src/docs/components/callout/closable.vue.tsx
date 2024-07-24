import { sentence, text } from 'data';

export default () => (
  <>
    <l-callout message={sentence} closable />
    <l-callout message={sentence} description={text} closable />
    <l-callout description="description" closable />
  </>
);
