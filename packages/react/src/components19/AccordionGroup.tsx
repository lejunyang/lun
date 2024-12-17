import { defineAccordionGroup, AccordionGroupProps, iAccordionGroup } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LAccordionGroup = createComponent<AccordionGroupProps, iAccordionGroup>('accordion-group', defineAccordionGroup);
if (__DEV__) LAccordionGroup.displayName = 'LAccordionGroup';
