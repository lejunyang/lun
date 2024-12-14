import { userEvent } from '@vitest/browser/context';

describe('Textarea', () => {
  it('type in textarea', async () => {
    let value = '';
    const onUpdate = vi.fn((e: any) => {
      value = e.detail;
    });
    const handlers = {
      onUpdate,
    };
    const ce = l('l-textarea', handlers);
    ce.focus();
    expect(ce.textarea?.tagName).to.equal('TEXTAREA');
    expect(ce.textarea.matches(':focus')).to.be.true;
    await userEvent.type(ce.textarea, 'Hello');
    expect(value).to.equal('Hello');
    expect(onUpdate).toHaveBeenCalledTimes(5);
  });
});
