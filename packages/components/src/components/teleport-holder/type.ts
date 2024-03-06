import { ExtractPropTypes } from "vue";

export const teleportHolderProps = {
}

export type TeleportHolderSetupProps = ExtractPropTypes<typeof teleportHolderProps>;
export type TeleportHolderProps = Partial<TeleportHolderSetupProps>;