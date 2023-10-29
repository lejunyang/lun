import { ExtractPropTypes, PropType } from 'vue';

export const dialogProps = {
  show: { type: Boolean, default: undefined },
  modal: { type: [Boolean, String] as PropType<boolean | 'native' | string>, default: true },
  movable: { type: Boolean },
  header: { type: Boolean, default: true },
  title: { type: String },
  closable: { type: Boolean },
  content: {},
  footer: { type: Boolean, default: true },
  okBtn: { type: Boolean, default: true },
  cancelBtn: { type: Boolean, default: true },
  // TODO intl
  okText: { type: String, default: () => 'Cancel' },
  cancelText: { type: String, default: () => 'OK' },
  okBtnProps: { type: Object },
  cancelBtnProps: { type: Object },
};

export type DialogProps = ExtractPropTypes<typeof dialogProps>;

declare module 'vue' {
  export interface IntrinsicElementAttributes {
    'l-dialog': DialogProps & HTMLAttributes;
  }
}
