import { freeze } from "@lun-web/utils";
import { CommonProps, GetEventPropsFromEmits } from "common";
import { ExtractPropTypes } from "vue";

export const teleportHolderProps = freeze({
});

export const teleportHolderEmits = freeze({});

export type TeleportHolderSetupProps = ExtractPropTypes<typeof teleportHolderProps> & CommonProps;
export type TeleportHolderEvents = GetEventPropsFromEmits<typeof teleportHolderEmits>;
export type TeleportHolderProps = Partial<TeleportHolderSetupProps>;