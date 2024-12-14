import { delay } from '@lun-web/utils';
import { userEvent } from '@vitest/browser/context';

describe('Popover', () => {
  it('auto attach by attr', async () => {
    l('l-popover', {
      autoAttachAttr: 'data-target',
      children: [
        ['l-button', { label: 'target1', 'data-target': 'target1', id: 'target1' }],
        ['l-button', { label: 'button2', id: 'defaultTarget' }],
        ['l-button', { label: 'target2', 'data-target': 'target2', id: 'target2' }],
        ['div', { textContent: 'popover1', slot: 'target1', id: 'pop1' }],
        ['div', { textContent: 'popover2', slot: 'target2', id: 'pop2' }],
        ['div', { textContent: 'default', slot: 'pop-content', id: 'defaultPop' }],
      ],
    });

    vi.useFakeTimers();

    const target1 = document.getElementById('target1')!,
      target2 = document.getElementById('target2')!,
      defaultTarget = document.getElementById('defaultTarget')!;
    const popover1 = document.getElementById('pop1')!,
      popover2 = document.getElementById('pop2')!,
      defaultPop = document.getElementById('defaultPop')!;

    expect(popover1.offsetWidth).toBe(0);
    expect(popover2.offsetWidth).toBe(0);
    expect(defaultPop.offsetWidth).toBe(0);

    await userEvent.hover(target1);
    await vi.advanceTimersByTimeAsync(50);
    expect(popover1.offsetWidth).toBeGreaterThan(0);
    expect(popover2.offsetWidth).toBe(0);
    expect(defaultPop.offsetWidth).toBe(0);

    await userEvent.hover(target2);
    await vi.advanceTimersByTimeAsync(50);
    expect(popover1.offsetWidth).toBe(0);
    expect(popover2.offsetWidth).toBeGreaterThan(0);
    expect(defaultPop.offsetWidth).toBe(0);

    // await userEvent.hover(defaultTarget); //  what's the different between hover and below??
    defaultTarget.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, composed: true }));
    await vi.advanceTimersByTimeAsync(50);
    expect(popover1.offsetWidth).toBe(0);
    expect(popover2.offsetWidth).toBe(0);
    expect(defaultPop.offsetWidth).toBeGreaterThan(0);

    await userEvent.click(target2);
    expect(popover1.offsetWidth).toBe(0);
    expect(popover2.offsetWidth).toBeGreaterThan(0);
    expect(defaultPop.offsetWidth).toBe(0);
  });

  it('ignoreSelf', async () => {
    l('l-popover', {
      autoAttachAttr: 'data-target',
      ignoreSelf: true,
      children: [
        ['l-button', { label: 'target1', 'data-target': 'target1', id: 'target1' }],
        ['l-button', { label: 'button2', id: 'defaultTarget' }],
        ['div', { textContent: 'popover1', slot: 'target1', id: 'pop1' }],
        ['div', { textContent: 'default', slot: 'pop-content', id: 'defaultPop' }],
      ],
    });

    const target1 = document.getElementById('target1')!,
      defaultTarget = document.getElementById('defaultTarget')!;
    const popover1 = document.getElementById('pop1')!,
      defaultPop = document.getElementById('defaultPop')!;

    expect(popover1.offsetWidth).toBe(0);
    expect(defaultPop.offsetWidth).toBe(0);

    await userEvent.hover(target1);
    await vi.waitFor(() => popover1.offsetWidth > 0);
    expect(defaultPop.offsetWidth).toBe(0);

    await userEvent.hover(defaultTarget);
    await vi.waitFor(() => popover1.offsetWidth === 0);
    expect(defaultPop.offsetWidth).toBe(0);
  });
});
