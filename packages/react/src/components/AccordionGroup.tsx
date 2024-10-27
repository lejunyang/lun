
import { accordionGroupEmits, AccordionGroupProps, accordionGroupProps, defineAccordionGroup, iAccordionGroup } from '@lun/components';
import createComponent from '../createComponent';

export const LAccordionGroup = createComponent<AccordionGroupProps, iAccordionGroup>('accordion-group', defineAccordionGroup, accordionGroupProps, accordionGroupEmits);
if (__DEV__) LAccordionGroup.displayName = 'LAccordionGroup';
