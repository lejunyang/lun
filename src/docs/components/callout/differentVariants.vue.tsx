import { text } from 'data';

export default function () {
  return (
    <>
      <l-callout variant="surface" message="surface" description={text} />
      <l-callout variant="soft" message="soft" description={text} />
      <l-callout variant="outline" message="outline" description={text} />
    </>
  );
}
