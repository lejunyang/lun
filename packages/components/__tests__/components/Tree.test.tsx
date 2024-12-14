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
    let updateValue: string[] = [],
      updateRawValue = new Set<string>();
    const onUpdate = vi.fn((e) => {
      updateValue = e.detail.checked.value;
      updateRawValue = e.detail.checked.raw;
    });
    const ce = l('l-tree', {
        items,
        checkable: true,
        defaultExpandAll: true,
        onCheck,
        onUpdate,
      }),
      root = ce.shadowRoot!;

    await nextTick();
    const item1 = root.querySelector('l-tree-item[value="1"]')!;
    expect(item1).not.toBeNull();

    const item112 = root.querySelector('l-tree-item[value="1.1.2"]')!;
    expect(item112).not.toBeNull();

    await getCheckboxAndClick(item112);
    expect(value).to.deep.equal(['1.1.2']);
    expect(rawValue).to.deep.equal(new Set(['1.1.2']));
    expect(updateValue).to.deep.equal(value);
    expect(updateRawValue).to.deep.equal(rawValue);
    expect(ce.methods.check.isIntermediate('1')).to.be.true;
    expect(ce.methods.check.isIntermediate('1.1')).to.be.true;

    // reverse
    ce.methods.check.reverse();
    await nextTick();
    expect(value).to.deep.equal(['1.1.1', '1.2', '1.3', '1.3.1', '2']);
    expect(rawValue).to.deep.equal(new Set(['1.1.1', '1.2', '1.3', '1.3.1', '2']));
    expect(ce.methods.check.isIntermediate('1')).to.be.true;
    expect(ce.methods.check.isIntermediate('1.1')).to.be.true;

    const allValues = ['1', '1.1', '1.1.1', '1.1.2', '1.2', '1.3', '1.3.1', '2'],
      allValueSet = new Set(allValues);

    ce.methods.check.toggle('1.1.2');
    await nextTick();
    // expect(value).to.deep.equal(allValues) // the set value is equal, but values in array are not in same order
    expect(rawValue).to.deep.equal(allValueSet);
    expect(ce.methods.check.isIntermediate('1')).to.be.false;
    expect(ce.methods.check.isIntermediate('1.1')).to.be.false;

    const item131 = root.querySelector('l-tree-item[value="1.3.1"]')!;
    await getCheckboxAndClick(item131);
    expect(rawValue).to.deep.equal(new Set(['1.1', '1.1.1', '1.1.2', '1.2', '2']));
    expect(ce.methods.check.isIntermediate('1')).to.be.true;

    const item11 = root.querySelector('l-tree-item[value="1.1"]')!;
    await getCheckboxAndClick(item11);
    expect(rawValue).to.deep.equal(new Set(['1.2', '2']));
    expect(ce.methods.check.isIntermediate('1')).to.be.true;

    await getCheckboxAndClick(item112);
    expect(rawValue).to.deep.equal(new Set(['1.1.2', '1.2', '2']));
    expect(ce.methods.check.isIntermediate('1')).to.be.true;
    expect(ce.methods.check.isIntermediate('1.1')).to.be.true;

    const item111 = root.querySelector('l-tree-item[value="1.1.1"]')!;
    await getCheckboxAndClick(item111);
    expect(rawValue).to.deep.equal(new Set(['1.1', '1.1.1', '1.1.2', '1.2', '2']));
    expect(ce.methods.check.isIntermediate('1')).to.be.true;
    expect(ce.methods.check.isIntermediate('1.1')).to.be.false;

    await getCheckboxAndClick(item112);
    expect(rawValue).to.deep.equal(new Set(['1.1.1', '1.2', '2']));
    expect(ce.methods.check.isIntermediate('1')).to.be.true;
    expect(ce.methods.check.isIntermediate('1.1')).to.be.true;

    // check all
    ce.methods.check.checkAll();
    await nextTick();
    expect(value).to.deep.equal(allValues);
    expect(rawValue).to.deep.equal(allValueSet);
    expect(ce.methods.check.isIntermediate('1')).to.be.false;
    expect(ce.methods.check.isIntermediate('1.1')).to.be.false;

    await getCheckboxAndClick(item111);
    expect(rawValue).to.deep.equal(new Set(['1.1.2', '1.2', '1.3', '1.3.1', '2']));
    expect(ce.methods.check.isIntermediate('1')).to.be.true;
    expect(ce.methods.check.isIntermediate('1.1')).to.be.true;

    // uncheck all
    ce.methods.check.uncheckAll();
    await nextTick();
    expect(value).to.deep.equal([]);
    expect(rawValue).to.deep.equal(new Set());
    expect(ce.methods.check.isIntermediate('1')).to.be.false;
    expect(ce.methods.check.isIntermediate('1.1')).to.be.false;
  });
});
