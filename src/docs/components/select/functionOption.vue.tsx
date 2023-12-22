import { optionsGetter } from 'data';

export default () => {
  return (
    <>
      <l-select options={optionsGetter} />
    </>
  );
}