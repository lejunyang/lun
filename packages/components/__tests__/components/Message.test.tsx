import { Message } from '@lun-web/components';
import { userEvent } from '@vitest/browser/context';
import { nextTick } from 'vue';

describe('Message', () => {
  it('auto close, hover to reset auto close', async () => {
    vi.useFakeTimers();
    const onOpen = vi.fn(),
      onAfterOpen = vi.fn(),
      onClose = vi.fn(),
      onAfterClose = vi.fn(),
      onAllClosed = vi.fn();
    const handlers = {
      onOpen,
      onAfterOpen,
      onClose,
      onAfterClose,
      onAllClosed,
    };
    const message = Message.open({
      message: 'first',
      key: 'first', // must set key, or Message will use Date.now() (we're using fake timers, Date.now() will always return same result if we don't advance it)
      duration: 5000,
      ...handlers,
    });
    message.open({
      message: 'second',
      key: 'second',
      duration: 10000,
      ...handlers,
    });
    message.open({
      message: 'third',
      key: 'third',
      duration: 'none',
      ...handlers,
    });
    await vi.waitFor(() => expect(onOpen).toBeCalledTimes(3));
    await vi.waitFor(() => expect(onAfterOpen).toBeCalledTimes(3));

    await vi.advanceTimersByTimeAsync(3000);
    expect(onClose).not.toBeCalled();
    expect(onAfterClose).not.toBeCalled();

    await vi.advanceTimersByTimeAsync(2000);
    expect(onClose).toBeCalledTimes(1);
    await vi.waitFor(() => expect(onAfterClose).toBeCalledTimes(1));
    expect(onAllClosed).not.toBeCalled();

    const second = message.shadowRoot!.querySelector(`[data-key='second']`)!;
    expect(second).not.toBeNull();
    await userEvent.hover(second); // hover to pause and reset auto close
    await vi.advanceTimersByTimeAsync(5000);
    expect(onClose).toBeCalledTimes(1);
    expect(onAfterClose).toBeCalledTimes(1);
    expect(onAllClosed).not.toBeCalled();

    await userEvent.unhover(second);
    await vi.advanceTimersByTimeAsync(10000);
    expect(onClose).toBeCalledTimes(2);
    await vi.waitFor(() => expect(onAfterClose).toBeCalledTimes(2));
    expect(onAllClosed).not.toBeCalled();

    message.close('third');
    await nextTick();
    expect(onClose).toBeCalledTimes(3);
    await vi.waitFor(() => expect(onAfterClose).toBeCalledTimes(3));
    expect(onAllClosed).toBeCalledTimes(1);
  });

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
