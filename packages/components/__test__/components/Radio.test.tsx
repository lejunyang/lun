import { userEvent } from '@vitest/browser/context';
import { nextTick } from 'vue';

describe('Radio', () => {
  it('RadioGroup with disabled', async () => {
    let value = '2',
      onUpdate = vi.fn((e) => (value = e.detail));
    const ce = l('l-radio-group', {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
          { label: 'Option 3', value: '3', disabled: true },
        ],
        value,
        onUpdate,
      }),
      root = ce.shadowRoot!;
    await nextTick();

    const radio2 = root.querySelector('l-radio[value="2"]')!;
    expect(radio2).not.toBeNull();
    expect(radio2.shadowRoot!.firstElementChild!.classList.contains('is-checked'));

    const radio1 = root.querySelector('l-radio[value="1"]')!,
      radio3 = root.querySelector('l-radio[value="3"]')!;
    await userEvent.click(radio1);
    expect(value).toBe('1');
    expect(radio1.shadowRoot!.firstElementChild!.classList.contains('is-checked'));

    await userEvent.click(radio3);
    expect(value).toBe('1');
    expect(onUpdate).toBeCalledTimes(1);
  });
});
