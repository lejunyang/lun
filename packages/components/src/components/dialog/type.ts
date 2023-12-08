import { MaybePromise } from '@lun/core';
import { ExtractPropTypes, PropType } from 'vue';
import { editStateProps, themeProps } from "common";

export const dialogProps = {
  ...editStateProps,
  ...themeProps,
  open: { type: Boolean, default: undefined },
  modal: { type: [Boolean, String] as PropType<boolean | 'native' | string> },
  maskClosable: { type: [Boolean, String] as PropType<boolean | 'click' | 'dblclick'> },
  escapeClosable: { type: Boolean },
  movable: { type: Boolean },
  width: { type: String },
  // title is global HTMLAttributes, will make the dialog show tooltip, so use headerTitle instead
  headerTitle: { type: String },
  noHeader: { type: Boolean },
  closeBtn: { type: Boolean },
  closeBtnProps: { type: Object },
  content: {},
  noFooter: { type: Boolean },
  okBtn: { type: Boolean, default: true },
  cancelBtn: { type: Boolean, default: true },
  // TODO intl
  okText: { type: String, default: () => 'OK' },
  cancelText: { type: String, default: () => 'Cancel' },
  okBtnProps: { type: Object },
  cancelBtnProps: { type: Object },
  beforeOpen: { type: Function as PropType<() => void> },
  afterOpen: { type: Function as PropType<() => void> },
  beforeOk: { type: Function as PropType<() => MaybePromise<boolean | void>> },
  beforeClose: { type: Function as PropType<() => MaybePromise<boolean | void>> },
  afterClose: { type: Function as PropType<() => void> },
};

export type DialogProps = ExtractPropTypes<typeof dialogProps>;
