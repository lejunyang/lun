import { createCollector, UseExpandMethods } from '@lun-web/core';
import { AccordionGroupProps, AccordionProps } from './type';
import { getCollectorOptions } from 'common';

export type AccordionGroupProvide = UseExpandMethods;

export const AccordionCollector = createCollector<AccordionGroupProps, AccordionProps, AccordionGroupProvide>(
  getCollectorOptions('accordion', true),
);
