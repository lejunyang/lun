import { MaybePromise } from '@lun/core';
import { ExtractPropTypes } from 'vue';
import {
  GetEventPropsFromEmits,
  PropBoolOrStr,
  PropBoolean,
  PropFunction,
  PropObjOrStr,
  PropObject,
  PropString,
  createTransitionProps,
  editStateProps,
  sizeProp,
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
  width: sizeProp,
  title: PropObjOrStr(),
  noHeader: PropBoolean(),
  noCloseBtn: PropBoolean(),
  closeBtnProps: PropObject(),
  content: {},
  contentType: PropString(),
  contentPreferHtml: PropBoolean(),
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
  beforeOk: PropFunction<() => MaybePromise<boolean | void>>(),
  /** function that will be called before closing dialog, if it returns false/Promise.resolve(false)/Promise.reject(), prevent closing dialog */
  beforeClose: PropFunction<() => MaybePromise<boolean | void>>(),
  disabledAllWhenPending: PropBoolean(),

  /** internal usage */
  isConfirm: PropBoolean(),
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

export type DialogExpose = {
  openDialog: () => void;
  closeDialog: () => Promise<void>;
  toggleDialog: () => Promise<void> | undefined;
};
