import { defineAccordion, AccordionProps, iAccordion } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LAccordion = createComponent<AccordionProps, iAccordion>('accordion', defineAccordion);
if (__DEV__) LAccordion.displayName = 'LAccordion';
