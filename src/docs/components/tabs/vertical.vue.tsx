const items = [
  {
    label: 'Tab 1',
    content: 'Content of tab 1',
  },
  {
    label: 'Tab 2',
    content: 'Content of tab 2',
  },
  {
    label: 'Tab 3',
    content: 'Content of tab 3',
  },
];
export default () => {
  return (
    <>
      <l-tabs items={items} type="vertical"></l-tabs>
      <l-tabs items={items} type="vertical" variant="solid"></l-tabs>
    </>
  );
};
