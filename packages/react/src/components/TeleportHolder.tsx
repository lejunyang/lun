
import { teleportHolderEmits, TeleportHolderProps, teleportHolderProps, defineTeleportHolder, iTeleportHolder } from '@lun/components';
import createComponent from '../createComponent';

export const LTeleportHolder = createComponent<TeleportHolderProps, iTeleportHolder>('teleport-holder', defineTeleportHolder, teleportHolderProps, teleportHolderEmits);
if (__DEV__) LTeleportHolder.displayName = 'LTeleportHolder';
