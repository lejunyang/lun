import { userEvent } from '@vitest/browser/context';
import { nextTick } from 'vue';

const items = [
  {
    label: 'Item 1',
    value: '1',
    children: [
      {
        label: 'Item 1.1',
        value: '1.1',
        children: [
          { label: 'Item 1.1.1', value: '1.1.1' },
          { label: 'Item 1.1.2', value: '1.1.2' },
          { label: 'Item 1.1.3', value: '1.1.3', disabled: true },
        ],
      },
      { label: 'Item 1.2', value: '1.2' },
      {
        label: 'Item 1.3',
        value: '1.3',
        children: [{ label: 'Item 1.3.1', value: '1.3.1' }],
      },
    ],
  },
  {
    label: 'Item 2',
    value: '2',
  },
];

const getCheckboxAndClick = async (item: Element) => {
  const checkbox = item.shadowRoot!.querySelector('l-checkbox');
  expect(checkbox).not.toBeNull();
  await userEvent.click(checkbox!);
};

describe('Tree', () => {
  it('checkable with prop items', async () => {
    let value: string[] = [],
      rawValue = new Set<string>();
    const onCheck = vi.fn((e) => {
      value = e.detail.value;
      rawValue = e.detail.raw;
    });
    const ce = l('l-tree', {
        items,
        checkable: true,
        defaultExpandAll: true,
        onCheck,
      }),
      root = ce.shadowRoot!;

    await nextTick();
    const item1 = root.querySelector('l-tree-item[value="1"]')!;
    expect(item1).not.toBeNull();

    const item12 = root.querySelector('l-tree-item[value="1.1.2"]')!;
    expect(item12).not.toBeNull();

    await getCheckboxAndClick(item12);
    expect(value).to.deep.equal(['1.1.2']);
    expect(rawValue).to.deep.equal(new Set(['1.1.2']));

    // reverse
    ce.methods.check.reverse();
    await nextTick();
    // FIXME reverse and intermediate have issues
  });
});
