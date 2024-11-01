import { nextTick } from 'vue';

describe('Calendar', () => {
  it('render dates correctly', async () => {
    const ce = l('l-calendar', {
        value: '2024-07-05',
      }),
      root = ce.shadowRoot!;

    await nextTick();

    let body = root.querySelector('.l-calendar__body')!;
    expect(body.children.length).toBe(42);
    let first = body.children[0];
    expect(first.textContent).toBe('30'); // 2024-06-30
    expect(first.classList.contains('is-preview')).toBe(true); // date in last month is in preview
    for (let i = 1; i < 42; i++) {
      const el = body.children[i];
      const isNextMonth = i > 31;
      expect(el.textContent).toBe(String(isNextMonth ? i - 31 : i));
      expect(el.classList.contains('is-preview')).toBe(isNextMonth);
      expect(el.classList.contains('is-inView')).toBe(!isNextMonth);
      if (i === 5) {
        expect(el.classList.contains('is-selected')).toBe(true); // 2024-07-05
        expect(el.classList.contains('is-singleSelected')).toBe(true);
      }
    }

    ce.removePreviewRow = true;
    await nextTick();
    body = root.querySelector('.l-calendar__body')!;
    // if removePreviewRow, preview dates that are in a row are removed, others are still rendered
    expect(body.children.length).toBe(35);
    first = body.children[0];
    expect(first.textContent).toBe('30'); // 2024-06-30
    expect(first.classList.contains('is-preview')).toBe(true);
    for (let i = 1; i < 35; i++) {
      const el = body.children[i];
      const isNextMonth = i > 31;
      expect(el.textContent).toBe(String(isNextMonth ? i - 31 : i));
      expect(el.classList.contains('is-preview')).toBe(isNextMonth);
      expect(el.classList.contains('is-inView')).toBe(!isNextMonth);
    }

    ce.removePreviewRow = false;
    ce.hidePreviewDates = true;
    await nextTick();
    body = root.querySelector('.l-calendar__body')!;
    // if hidePreviewDates, preview dates that are in a row are removed, others are rendered with empty content
    expect(body.children.length).toBe(35);
    first = body.children[0];
    expect(first.textContent).toBe(''); // 2024-06-30
    expect(first.classList.contains('is-preview')).toBe(true);
    for (let i = 1; i < 35; i++) {
      const el = body.children[i];
      const isNextMonth = i > 31;
      if (isNextMonth) expect(el.textContent).toBe('');
      else expect(el.textContent).toBe(String(i));
      expect(el.classList.contains('is-preview')).toBe(isNextMonth);
      expect(el.classList.contains('is-inView')).toBe(!isNextMonth);
    }
  });
});
