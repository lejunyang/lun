
import { accordionEmits, AccordionProps, accordionProps, defineAccordion, iAccordion } from '@lun-web/components';
import createComponent from '../createComponent';

export const LAccordion = createComponent<AccordionProps, iAccordion>('accordion', defineAccordion, accordionProps, accordionEmits);
if (__DEV__) LAccordion.displayName = 'LAccordion';