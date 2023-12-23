import { text } from 'data';

export default () => {
  return (
    <>
      {text}
      <l-divider textStyle="color: red; font-weight: bold;">Red Bold Text</l-divider>
      {text}
      <l-divider textPosition="start" textIndent="0" textStyle={{ padding: 0, fontStyle: 'italic' }}>
        Start 0px, No padding
      </l-divider>
    </>
  );
};
