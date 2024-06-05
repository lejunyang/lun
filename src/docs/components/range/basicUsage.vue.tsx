export default () => {
  return (
    <>
      <l-range value={30}></l-range>
      <l-range value={30} readonly></l-range>
      <l-range value={30} disabled></l-range>
      <l-range value={30} type="vertical"></l-range>
      <l-range value={30} type="vertical" readonly></l-range>
      <l-range value={30} type="vertical" disabled></l-range>
    </>
  );
};
