import { text } from 'data';

export default () => {
  return (
    <>
      {text}
      <l-divider dashed>Dashed center</l-divider>
      {text}
      <l-divider textPosition="start">Start</l-divider>
      {text}
      <l-divider textPosition="end">End</l-divider>
      {text}
      <l-divider textPosition="start" textIndent="0">
        Start 0px
      </l-divider>
      {text}
      <l-divider textPosition="end" textIndent="15">
        End 15px
      </l-divider>
    </>
  );
};
