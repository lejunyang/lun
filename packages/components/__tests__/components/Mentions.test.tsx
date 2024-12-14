const options = [
  { label: 'option1', value: 'value1' },
  { label: 'option2', value: 'value2', disabled: true },
  { label: 'option3', value: 'value3' },
  { label: 'option4', value: 'value4' },
  { label: 'option5', value: 'value5' },
];

describe('Mentions', () => {
  it('should render correctly', async () => {
    const ce = l('l-mentions', {
        value: 'test@value1 @value4 what',
        options,
      }),
      root = ce.shadowRoot!;
    const edit = root.querySelector('[contenteditable]')!;
    expect(edit).not.toBeNull();
    expect(edit.children[0].textContent).toBe('test');
    // at the beginning, edit.children[1].textContent is value1 // TODO check what delay this
    await vi.waitFor(() => expect(edit.children[1].textContent).toBe('option1'));
    expect(edit.children[2].textContent).toBe('');
    expect(edit.children[3].textContent).toBe('option4');
    expect(edit.children[4].textContent).toBe('what');
  });
});
