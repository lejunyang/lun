export default () => {
  return (
    <>
      <l-range value={30}></l-range>
      <l-range value={'3'.padEnd(17, '0')} max={'10'.padEnd(18, '0')} valueType="number-text"></l-range>
      <l-range value={30} disabled></l-range>
      <l-range value={30} type="vertical"></l-range>
      <l-range value={30} type="vertical" disabled></l-range>
    </>
  );
};
