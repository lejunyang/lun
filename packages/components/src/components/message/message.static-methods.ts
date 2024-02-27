import { getElementFirstName, getFirstThemeProvider, toElement } from 'utils';
import { MessageOpenConfig, MessageProps } from './type';
import { iMessage } from './Message';

let message: iMessage;

export const methods = {
  open({
    getContainer,
    placement,
    offset,
    ...config
  }: MessageOpenConfig & { getContainer?: () => Element | string } & Pick<MessageProps, 'placement' | 'offset'> = {}) {
    if (!message || !message.isConnected) {
      const container = (getContainer && toElement(getContainer())) || getFirstThemeProvider() || document.body;
      const messageName = getElementFirstName('message')!;
      if (__DEV__ && !messageName) throw new Error('message component is not registered, please register it first.');
      message = document.createElement(messageName) as iMessage;
      container.append(message);
    }
    Object.assign(message, {
      placement,
      offset,
    });
    message.open(config);
    return message;
  },
  close(key: string | number) {
    if (message) message.close(key);
  },
  closeAll() {
    if (message) message.closeAll();
  },
};
