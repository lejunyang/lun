describe('Dialog', () => {
  it('default top layer dialog', async () => {
    const buttonClick = vi.fn(() => dialog.openDialog());
    const dialog = l('l-dialog', {
        children: [
          [
            'div',
            {
              tabindex: '0',
              autofocus: '',
              id: 'focus',
              textContent: 'Text',
            },
          ],
        ],
      }),
      button = l('l-button', {
        onClick: buttonClick,
      });
    button.click();
    const nativeDialog = dialog.shadowRoot!.firstElementChild!;
    expect(nativeDialog.tagName).toBe('DIALOG');
    expect(nativeDialog.matches(':modal')).to.be.true;

    // button.click(); // calling on button's click still triggers click... seems modal only prevents user clicking
  });
});
