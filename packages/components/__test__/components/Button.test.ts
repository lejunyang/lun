import { delay } from '@lun-web/utils';

describe('Button', () => {
  it('asyncHandler', async () => {
    vi.useFakeTimers();
    const asyncHandler = vi.fn(() => delay(100)),
      onValidClick = vi.fn();
    const props = { label: 'Button', asyncHandler, onValidClick };
    const ce = l('l-button', props);

    const root = ce.shadowRoot!,
      button = root.firstElementChild as HTMLButtonElement;
    expect(button.tagName).to.equal('BUTTON');
    expect(root.querySelector('l-spin')).toBe(null);
    vi.runAllTimers();

    button.click();
    expect(asyncHandler).toHaveBeenCalledOnce();
    expect(onValidClick).toHaveBeenCalledOnce();
    button.click();
    expect(asyncHandler).toHaveBeenCalledOnce();
    expect(onValidClick).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(10);
    button.click();
    expect(asyncHandler).toHaveBeenCalledOnce();
    expect(onValidClick).toHaveBeenCalledOnce();
    expect(root.querySelector('l-spin')?.tagName).to.equal('L-SPIN');

    await vi.advanceTimersByTimeAsync(100);
    expect(root.querySelector('l-spin')).toBe(null);
    button.click();
    expect(asyncHandler).toHaveBeenCalledTimes(2);
    expect(onValidClick).toHaveBeenCalledTimes(2);

    vi.clearAllTimers();
  });
});
