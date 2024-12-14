describe('Range', () => {
  it('should render correctly', () => {
    const ce = l('l-range', {
        value: 30,
      }),
      root = ce.shadowRoot!;
    const first = root.firstElementChild as HTMLElement;
    expect(first.style.getPropertyValue('--l-range-min')).toBe('0');
    expect(first.style.getPropertyValue('--l-range-max')).toBe('0.3');
    const thumb = root.querySelector('.l-range__thumb') as HTMLElement;
    expect(thumb.style.getPropertyValue('--l-range-percent')).toBe('0.3');
  });
});
