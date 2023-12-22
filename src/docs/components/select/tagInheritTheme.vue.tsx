import { optionsWithColors, groupOptionsWithColors } from 'data';

export default () => {
  return (
    <>
      <l-select options={optionsWithColors} multiple />
      <l-select options={groupOptionsWithColors} multiple />
    </>
  );
};
