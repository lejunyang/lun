import { userEvent } from '@vitest/browser/context';

describe('Tag', () => {
  it('removable tag', async () => {
    const onRemove = vi.fn(),
      onAfterRemove = vi.fn();
    const ce = l('l-tag', {
        removable: true,
        label: 'label',
        onRemove,
        onAfterRemove,
      }),
      root = ce.shadowRoot!;
    const icon = root.querySelector('l-icon')!;
    expect(icon).not.toBeNull();
    await userEvent.click(icon);
    expect(onRemove).toBeCalledTimes(1);
    await vi.waitFor(() => expect(onAfterRemove).toBeCalledTimes(1));
    expect(root.firstElementChild).toBeNull();
  });
});
