import { messageEmits, messageProps, defineMessage, MessageProps, iMessage } from '@lun-web/components';
import createComponent from '../createComponent';

export const LMessage = createComponent<MessageProps, iMessage>('message', defineMessage, messageProps, messageEmits);
if (__DEV__) LMessage.displayName = 'LMessage';
