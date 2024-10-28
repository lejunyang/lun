import { nextTick } from 'vue';

describe('defineCustomElement', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('test boolean prop with default true', async () => {
    const ce = l('l-spin'),
      root = ce.shadowRoot!;

    expect(root.firstElementChild?.tagName).toBe('svg');

    ce.spinning = false;
    await nextTick();
    expect(root.firstElementChild).toBeNull();

    ce.spinning = undefined;
    await nextTick();
    expect(root.firstElementChild?.tagName).toBe('svg');

    (ce as any).spinning = null;
    await nextTick();
    expect(root.firstElementChild).toBeNull();

    (ce as any).spinning = '';
    await nextTick();
    expect(root.firstElementChild?.tagName).toBe('svg');
  });

  it('remove and append element with another element in it', async () => {
    const ce = l('l-input');
    const parent = ce.parentElement!;

    ce.remove();
    await vi.advanceTimersByTimeAsync(1);
    parent.append(ce);
    await vi.advanceTimersByTimeAsync(1);

    ce.remove();
    await vi.advanceTimersByTimeAsync(1);
    parent.append(ce);
    await vi.advanceTimersByTimeAsync(1);

    // should not throw Error
  });
});
