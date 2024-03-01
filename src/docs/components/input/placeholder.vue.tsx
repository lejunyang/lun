import { text } from 'data';

export default function () {
  return (
    <>
      <l-input placeholder="placeholder" />
      <l-input placeholder="disabled" disabled />
      <l-input placeholder="readonly" readonly />
      <l-input placeholder={text} />
    </>
  );
}
