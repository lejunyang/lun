import { ExtractPropTypes } from 'vue';
import { themeProps, GetEventPropsFromEmits, CommonProps, undefBoolProp, createTransitionProps } from 'common';
import { freeze } from '@lun/utils';

export const accordionProps = freeze({
  ...themeProps,
  header: {},
  content: {},
  ...createTransitionProps('content'),
  open: undefBoolProp,
});

export const accordionEmits = freeze({
  open: null,
  afterOpen: null,
  close: null,
  afterClose: null,
});

export type AccordionSetupProps = ExtractPropTypes<typeof accordionProps> & CommonProps;
export type AccordionEvents = GetEventPropsFromEmits<typeof accordionEmits>;
export type AccordionProps = Partial<AccordionSetupProps> & AccordionEvents;
