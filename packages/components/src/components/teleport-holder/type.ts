import { freeze } from "@lun-web/utils";
import { CommonProps, GetEventMapFromEmits, GetEventPropsFromEmits } from "common";
import { ExtractPropTypes } from "vue";

export const teleportHolderProps = freeze({
});

export const teleportHolderEmits = freeze({});

export type TeleportHolderSetupProps = ExtractPropTypes<typeof teleportHolderProps> & CommonProps;
export type TeleportHolderEventProps = GetEventPropsFromEmits<typeof teleportHolderEmits>;
export type TeleportHolderEventMap = GetEventMapFromEmits<typeof teleportHolderEmits>;
export type TeleportHolderProps = Partial<TeleportHolderSetupProps> & TeleportHolderEventProps;