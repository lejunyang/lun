const items = [
  {
    label: 'Tab 1',
    panel: 'Content of tab 1',
  },
  {
    label: 'Tab 2',
    panel: 'Content of tab 2',
  },
  {
    label: 'Tab 3',
    panel: 'Content of tab 3',
  },
];
export default () => {
  return (
    <>
      <l-tabs items={items} variant="solid"></l-tabs>
    </>
  );
};
