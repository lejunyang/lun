import { MaybePromise } from '@lun/core';
import { ExtractPropTypes, PropType } from 'vue';
import {
  GetEventPropsFromEmits,
  PropBoolOrStr,
  PropBoolean,
  PropFunction,
  PropObject,
  PropString,
  createTransitionProps,
  editStateProps,
  themeProps,
} from 'common';

export const dialogProps = {
  ...editStateProps,
  ...themeProps,
  ...createTransitionProps('panel'),
  ...createTransitionProps('mask'),
  open: PropBoolean(),
  noMask: PropBoolean(),
  noTopLayer: PropBoolean(),
  maskClosable: PropBoolOrStr<boolean | 'click' | 'dblclick'>(),
  escapeClosable: PropBoolean(),
  movable: PropBoolean(),
  width: PropString(),
  // title is a global HTMLAttributes, will make the dialog show tooltip, so use headerTitle instead
  headerTitle: PropString(),
  noHeader: PropBoolean(),
  noCloseBtn: PropBoolean(),
  closeBtnProps: PropObject(),
  content: {},
  noFooter: PropBoolean(),
  noOkBtn: PropBoolean(),
  noCancelBtn: PropBoolean(),
  okText: PropString(),
  cancelText: PropString(),
  okBtnProps: PropObject(),
  cancelBtnProps: PropObject(),
  /** function that will be called before opening dialog, if it returns false, prevent opening dialog */
  beforeOpen: PropFunction<() => void | boolean>(),
  /** function that will be called on clicking ok button, if it returns false/Promise.resolve(false)/Promise.reject(), dialog stays open and will not trigger ok event */
  beforeOk: { type: Function as PropType<() => MaybePromise<boolean | void>> },
  /** function that will be called before closing dialog, if it returns false/Promise.resolve(false)/Promise.reject(), prevent closing dialog */
  beforeClose: { type: Function as PropType<() => MaybePromise<boolean | void>> },
  disabledAllWhenPending: PropBoolean(),
};

export const dialogEmits = {
  update: (_detail: boolean) => null,
  open: null,
  afterOpen: null,
  close: null,
  afterClose: null,
};

export type DialogSetupProps = ExtractPropTypes<typeof dialogProps>;
export type DialogEvents = GetEventPropsFromEmits<typeof dialogEmits>;
export type DialogProps = Partial<DialogSetupProps> & DialogEvents;
