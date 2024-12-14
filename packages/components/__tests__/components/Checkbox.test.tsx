import { userEvent } from '@vitest/browser/context';
import { render } from 'vitest-browser-vue';
import { nextTick, ref } from 'vue';

const options = [
  { label: 'option1', value: 'value1' },
  { label: 'option2', value: 'value2', disabled: true },
  { label: 'option3', value: 'value3' },
  { label: 'option4', value: 'value4' },
  { label: 'option5', value: 'value5' },
];

describe('Checkbox', () => {
  it('checkbox', async () => {
    let updateValue = '',
      checked: any;
    const onUpdate = vi.fn((e: any) => {
      updateValue = e.detail?.value;
      checked = e.detail?.checked;
    });
    const ce = l('l-checkbox', { trueValue: 'true', falseValue: 'false', label: 'label', onUpdate }),
      root = ce.shadowRoot!;
    const checkedIcon = root.querySelector('l-icon[name=check]')!;
    expect(checkedIcon).to.not.be.null;
    expect(checkedIcon.checkVisibility()).to.be.false;

    await userEvent.click(ce);
    expect(checkedIcon.checkVisibility()).to.be.true;
    expect(updateValue).to.equal('true');
    expect(checked).to.be.true;

    await userEvent.click(ce);
    expect(checkedIcon.checkVisibility()).to.be.false;
    expect(updateValue).to.equal('false');
    expect(checked).to.be.false;

    expect(onUpdate).toBeCalledTimes(2);
  });

  it('checkbox group', async () => {
    let rawSet: Set<string> = new Set(),
      value: string[] = [],
      allChecked = false,
      intermediate = false;
    const onUpdate = vi.fn((e) => {
      rawSet = e.detail.raw;
      value = e.detail.value;
      allChecked = e.detail.allChecked;
      intermediate = e.detail.intermediate;
    });
    const group = ref();
    render(() => (
      <>
        <l-checkbox-group ref={group} onUpdate={onUpdate} options={[{ checkForAll: true, label: '全选' }, ...options]}>
          <l-checkbox readonly value="readonly">
            readonly项
          </l-checkbox>
          <l-checkbox>无value项</l-checkbox>
        </l-checkbox-group>
      </>
    ));
    const children = group.value.shadowRoot.firstElementChild.children as HTMLElement[];
    expect(children[0].hasAttribute('check-for-all')).to.be.true;

    await userEvent.click(children[1]);
    expect(rawSet.size).toBe(1);
    expect(rawSet.has('value1')).to.be.true;
    expect(value).to.deep.equal(['value1']);
    expect(allChecked).to.be.false;
    expect(intermediate).to.be.true;

    // click disabled
    await userEvent.click(children[2]);
    expect(rawSet.size).toBe(1);
    expect(rawSet.has('value1')).to.be.true;
    expect(value).to.deep.equal(['value1']);
    expect(allChecked).to.be.false;
    expect(intermediate).to.be.true;

    // reverse
    group.value.reverse();
    await nextTick();
    expect(value).to.deep.equal(['value3', 'value4', 'value5', 'readonly']);
    expect(rawSet).to.deep.equal(new Set(['value3', 'value4', 'value5', 'readonly']));
    expect(allChecked).to.be.false;
    expect(intermediate).to.be.true;

    // reverse again
    group.value.reverse();
    await nextTick();
    expect(value).to.deep.equal(['value1']);
    expect(rawSet).to.deep.equal(new Set(['value1']));
    expect(allChecked).to.be.false;
    expect(intermediate).to.be.true;

    // check all
    await userEvent.click(children[0]);
    expect(value).to.deep.equal(['value1', 'value3', 'value4', 'value5', 'readonly']);
    expect(rawSet).to.deep.equal(new Set(['value1', 'value3', 'value4', 'value5', 'readonly']));
    expect(allChecked).to.be.true;
    expect(intermediate).to.be.false;

    // clear all
    await userEvent.click(children[0]);
    expect(value).to.deep.equal([]);
    expect(rawSet).to.deep.equal(new Set());
    expect(allChecked).to.be.false;
    expect(intermediate).to.be.false;
  });

  it(`should not be able to check if it's disabled, readonly or loading`, async () => {
    const onUpdate = vi.fn();
    const ce = l('l-checkbox-group', {
      disabled: true,
      options,
      onUpdate,
    });
    await nextTick();
    const children = ce.shadowRoot!.firstElementChild!.children;
    await userEvent.click(children[0]);
    expect(onUpdate).not.toHaveBeenCalled();

    ce.disabled = false;
    ce.readonly = true;
    await nextTick();
    await userEvent.click(children[0]);
    expect(onUpdate).not.toHaveBeenCalled();

    ce.readonly = false;
    ce.loading = true;
    await nextTick();
    await userEvent.click(children[0]);
    expect(onUpdate).not.toHaveBeenCalled();

    ce.loading = false;
    await nextTick();
    await userEvent.click(children[0]);
    expect(onUpdate).toHaveBeenCalled();
  });
});
