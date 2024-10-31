import { delay } from '@lun-web/utils';
import { userEvent } from '@vitest/browser/context';

describe('Switch', () => {
  it('async beforeUpdate', async () => {
    const resolveFalse = vi.fn(async () => delay(1000).then(() => false)),
      reject = vi.fn(async () => delay(1000).then(() => Promise.reject())),
      throwError = vi.fn(async () => {
        await delay(1000);
        throw new Error('error');
      }),
      returnVoid = vi.fn(async () => delay(1000)),
      onUpdate = vi.fn();
    const ce = l('l-switch', {
      onUpdate,
    });
    ce.beforeUpdate = resolveFalse;

    vi.useFakeTimers();

    await userEvent.click(ce);
    const getSpin = () => ce.shadowRoot!.querySelector('l-spin');
    const input = ce.shadowRoot!.querySelector('input')!;
    expect(getSpin()).toBeTruthy();
    expect(onUpdate).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
    await vi.advanceTimersByTimeAsync(1000);
    expect(getSpin()).to.be.null;
    expect(input.checked).toBe(false);
    expect(onUpdate).not.toHaveBeenCalled();

    ce.beforeUpdate = reject;
    await userEvent.click(ce);
    expect(getSpin()).toBeTruthy();
    expect(onUpdate).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
    await vi.advanceTimersByTimeAsync(1000);
    expect(getSpin()).to.be.null;
    expect(input.checked).toBe(false);
    expect(onUpdate).not.toHaveBeenCalled();

    ce.beforeUpdate = throwError;
    await userEvent.click(ce);
    expect(getSpin()).toBeTruthy();
    expect(onUpdate).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
    await vi.advanceTimersByTimeAsync(1000);
    expect(getSpin()).to.be.null;
    expect(input.checked).toBe(false);
    expect(onUpdate).not.toHaveBeenCalled();

    ce.beforeUpdate = returnVoid;
    await userEvent.click(ce);
    expect(getSpin()).toBeTruthy();
    expect(onUpdate).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
    await vi.advanceTimersByTimeAsync(1000);
    expect(getSpin()).to.be.null;
    expect(input.checked).toBe(true);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});
