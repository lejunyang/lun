const label = {
  interval: 2000,
  values: ['label', 'very long label very long label very long', 'third'],
};
const dLabel = {
  interval: 2000,
  toString() {
    return `动态标签${new Date()}`;
  },
};
export default () => {
  return (
    <>
      <l-input label={label} labelType="carousel" placeholder="placeholder" />
      <l-input label={label} labelType="carousel" />
      <l-input label={label} labelType="carousel" multiple />
      <l-input label={dLabel} labelType="carousel" class="w-full" />
    </>
  );
};
