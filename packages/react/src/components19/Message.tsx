import { defineMessage, MessageProps, iMessage } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LMessage = createComponent<MessageProps, iMessage>('message', defineMessage);
if (__DEV__) LMessage.displayName = 'LMessage';
