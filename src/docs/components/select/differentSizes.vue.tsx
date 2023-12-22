import { groupOptions } from 'data';
export default () => {
  return (
    <>
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <l-select size={i + 1} placeholder={`Size ${i + 1}`} options={groupOptions} />
        ))}
    </>
  );
};
