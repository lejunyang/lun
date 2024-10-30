import { DraggableFn, MaybePromise } from '@lun-web/core';
import { CSSProperties, ExtractPropTypes } from 'vue';
import {
  CommonProps,
  GetEventPropsFromEmits,
  Prop,
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
  undefBoolProp,
} from 'common';
import { freeze } from '@lun-web/utils';
import { GetCustomRendererSource } from '../custom-renderer';

export const dialogProps = freeze({
  ...editStateProps,
  ...themeProps,
  ...createTransitionProps('panel', 'mask'),
  open: undefBoolProp,
  container: PropObjOrStr<HTMLElement | string>(),
  noMask: PropBoolean(),
  noTopLayer: PropBoolean(),
  alwaysTrapFocus: PropBoolean(),
  maskClosable: PropBoolOrStr<boolean | 'click' | 'dblclick'>(),
  escapeClosable: PropBoolean(),
  /** make the header of dialog draggable */
  headerDraggable: PropBoolean(),
  /** used to determine which part elements of dialog can be dragged */
  customDraggable: PropFunction<DraggableFn>(), // draggable is a html attribute, use customDraggable instead
  noTransform: PropBoolean(),
  width: sizeProp,
  title: PropObjOrStr(),
  noHeader: PropBoolean(),
  noCloseBtn: PropBoolean(),
  closeBtnProps: PropObject(),
  content: Prop<GetCustomRendererSource>(),
  noFooter: PropBoolean(),
  noOkBtn: PropBoolean(),
  noCancelBtn: PropBoolean(),
  okText: PropString(),
  cancelText: PropString(),
  okBtnProps: PropObject(),
  cancelBtnProps: PropObject(),
  noLockScroll: PropBoolean(),
  /** set styles for dialog panel, 'width' of it takes priority over 'width' prop */
  panelStyle: PropObject<CSSProperties>(),
  maskStyle: PropObject<CSSProperties>(),
  /** function that will be called before opening dialog, if it returns false, prevent opening dialog */
  beforeOpen: PropFunction<() => void | boolean>(),
  /** function that will be called on clicking ok button, if it returns false/Promise.resolve(false)/Promise.reject()/throws Error, dialog stays open and will not fire ok event */
  beforeOk: PropFunction<() => MaybePromise<boolean | void>>(),
  /** function that will be called before closing dialog, if it returns false/Promise.resolve(false)/Promise.reject()/throws Error, prevent closing dialog */
  beforeClose: PropFunction<() => MaybePromise<boolean | void>>(),
  disableWhenPending: PropBoolean(),

  /** internal usage */
  isConfirm: PropBoolean(),
});

export const dialogEmits = freeze({
  update: (_detail: boolean) => null,
  open: null,
  afterOpen: null,
  close: null,
  afterClose: null,
});

export type DialogSetupProps = ExtractPropTypes<typeof dialogProps> & CommonProps;
export type DialogEvents = GetEventPropsFromEmits<typeof dialogEmits>;
export type DialogProps = Partial<DialogSetupProps> & DialogEvents;
