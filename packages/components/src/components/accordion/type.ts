import { ExtractPropTypes } from 'vue';
import {
  themeProps,
  GetEventPropsFromEmits,
  CommonProps,
  undefBoolProp,
  createTransitionProps,
  PropBoolean,
  PropString,
  editStateProps,
  PropObjOrStr,
  Prop,
  createEmits,
  OpenCloseEmits,
  openCloseEmits,
} from 'common';
import { freeze, MaybeArray, MaybeSet } from '@lun-web/utils';

export const accordionProps = freeze({
  ...themeProps,
  ...editStateProps,
  header: {},
  content: {},
  ...createTransitionProps('content'),
  open: undefBoolProp,
  /** unique name of current accordion in accordion-group */
  name: PropString(),
  iconPosition: PropString<'start' | 'end'>(),
  iconName: PropObjOrStr<string | { open?: string; close?: string }>(),
  iconLibrary: PropObjOrStr<string | { open?: string; close?: string }>(),
});

export const accordionEmits = createEmits<
  {
    update: boolean;
  } & OpenCloseEmits
>(['update', ...openCloseEmits]);

export type AccordionSetupProps = ExtractPropTypes<typeof accordionProps> & CommonProps;
export type AccordionEvents = GetEventPropsFromEmits<typeof accordionEmits>;
export type AccordionProps = Partial<AccordionSetupProps> & AccordionEvents;

type OpenType = string | number;

export const accordionGroupProps = freeze({
  ...themeProps,
  ...editStateProps,
  open: Prop<MaybeArray<OpenType> | MaybeSet<OpenType>>(),
  defaultOpen: Prop(),
  allowMultiple: PropBoolean(),
});

export const accordionGroupEmits = createEmits<{
  update: { value: MaybeArray<OpenType> | null; raw: MaybeSet<OpenType> | null };
}>(['update']);

export type AccordionGroupSetupProps = ExtractPropTypes<typeof accordionGroupProps> & CommonProps;
export type AccordionGroupEvents = GetEventPropsFromEmits<typeof accordionGroupEmits>;
export type AccordionGroupProps = Partial<AccordionGroupSetupProps> & AccordionGroupEvents;
