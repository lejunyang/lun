import { createCollector, useGroupOpenMethods } from '@lun/core';
import { AccordionGroupProps, AccordionProps } from './type';
import { getCollectorOptions } from 'common';

export type AccordionGroupProvide = ReturnType<typeof useGroupOpenMethods>;

export const AccordionCollector = createCollector<AccordionGroupProps, AccordionProps, AccordionGroupProvide>(
  getCollectorOptions('accordion', true),
);
