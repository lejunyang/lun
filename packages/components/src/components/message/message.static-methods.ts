import { getElementFirstName, getFirstThemeProvider, toElement } from 'utils';
import { MessageOpenConfig, MessageProps } from './type';
import { iMessage } from './Message';
import { createElement, isString } from '@lun/utils';
import { Status } from 'common';

let message: iMessage;

const transformConfig = (config: string | Omit<MessageStaticMethodParams, 'type'>, type: Status) => {
  if (isString(config)) return { message: config, type };
  else return { ...config, type };
};

export type MessageStaticMethodParams = MessageOpenConfig & { getContainer?: () => Element | string } & Pick<
    MessageProps,
    'placement' | 'offset'
  >;
export const methods = {
  open({ getContainer, placement, offset, ...config }: MessageStaticMethodParams = {}) {
    if (!message || !message.isConnected) {
      const container = (getContainer && toElement(getContainer())) || getFirstThemeProvider() || document.body;
      const messageName = getElementFirstName('message')!;
      if (__DEV__ && !messageName) throw new Error('message component is not registered, please register it first.');
      message = createElement(messageName as any) as iMessage;
      container.append(message);
    }
    Object.assign(message, {
      placement,
      offset,
    });
    message.open(config);
    return message;
  },
  success(config: string | Omit<MessageStaticMethodParams, 'type'>) {
    return methods.open(transformConfig(config, 'success'));
  },
  error(config: string | Omit<MessageStaticMethodParams, 'type'>) {
    return methods.open(transformConfig(config, 'error'));
  },
  warning(config: string | Omit<MessageStaticMethodParams, 'type'>) {
    return methods.open(transformConfig(config, 'warning'));
  },
  info(config: string | Omit<MessageStaticMethodParams, 'type'>) {
    return methods.open(transformConfig(config, 'info'));
  },
  close(key: string | number) {
    if (message) message.close(key);
  },
  closeAll() {
    if (message) message.closeAll();
  },
};
