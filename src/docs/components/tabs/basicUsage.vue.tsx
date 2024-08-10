const items = [
  {
    label: 'Tab 1',
    content: 'Content of tab 1',
  },
  {
    label: 'Tab 2',
    content: 'Content of tab 2',
  },
];
export default () => {
  return (
    <>
      <l-tabs items={items}></l-tabs>
      <l-tabs defaultActiveSlot="2">
        <l-tab-item slot="1" label="Tab 1">111</l-tab-item>
        <l-tab-item slot="2" label="Tab 2">222</l-tab-item>
      </l-tabs>
    </>
  );
};
