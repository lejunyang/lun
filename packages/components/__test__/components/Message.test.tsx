import { Message } from '@lun-web/components';
import { nextTick } from 'vue';
describe('Message', () => {
  it('static methods container', async () => {
    let message = Message.open('hello') as HTMLElement;
    expect(message.parentElement!.tagName).toBe('BODY');
    await nextTick();
    const hello = message.shadowRoot!.querySelector('l-callout')!;
    expect(hello).not.be.null;
    expect(hello.message).toBe('hello');
    message.remove();

    const theme = l('l-theme-provider');
    message = Message.open({
      message: 'title',
      description: 'description',
    });
    expect(message.parentElement).toBe(theme);
    await nextTick();
    const title = message.shadowRoot!.querySelector('l-callout')!;
    expect(title.message).toBe('title');
    expect(title.description).toBe('description');
    message.remove();

    const container = l('div');
    message = Message.open({
      message: 'under container',
      getContainer: () => container,
    });
    expect(message.parentElement).toBe(container);
    message.remove();
  });
});
