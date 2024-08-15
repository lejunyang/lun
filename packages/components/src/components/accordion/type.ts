import { ExtractPropTypes } from 'vue';
import {
  themeProps,
  GetEventPropsFromEmits,
  CommonProps,
  undefBoolProp,
  createTransitionProps,
  PropBoolean,
  PropNumOrArr,
  PropString,
  editStateProps,
} from 'common';
import { freeze } from '@lun/utils';

export const accordionProps = freeze({
  ...themeProps,
  ...editStateProps,
  header: {},
  content: {},
  ...createTransitionProps('content'),
  open: undefBoolProp,
  /** unique name of current accordion in accordion-group */
  name: PropString(),
});

export const accordionEmits = freeze({
  update: (_: boolean) => null,
  open: null,
  afterOpen: null,
  close: null,
  afterClose: null,
});

export type AccordionSetupProps = ExtractPropTypes<typeof accordionProps> & CommonProps;
export type AccordionEvents = GetEventPropsFromEmits<typeof accordionEmits>;
export type AccordionProps = Partial<AccordionSetupProps> & AccordionEvents;

export const accordionGroupProps = freeze({
  ...themeProps,
  ...editStateProps,
  open: PropNumOrArr(),
  defaultOpen: PropNumOrArr(),
  allowMultiple: PropBoolean(),
});

export const accordionGroupEmits = freeze({
  update: (_: string | number | (string | number)[]) => null,
});

export type AccordionGroupSetupProps = ExtractPropTypes<typeof accordionGroupProps> & CommonProps;
export type AccordionGroupEvents = GetEventPropsFromEmits<typeof accordionGroupEmits>;
export type AccordionGroupProps = Partial<AccordionGroupSetupProps> & AccordionGroupEvents;
