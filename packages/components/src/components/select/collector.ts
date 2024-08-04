import { createCollector, useSelectMethods } from '@lun/core';
import { ComponentInternalInstance } from 'vue';
import { CommonProcessedOption } from 'hooks';
import { SelectOptionProps, SelectProps } from './type';
import { getCollectorOptions } from 'common';

export const SelectCollector = createCollector<
  SelectProps,
  SelectOptionProps,
  ReturnType<typeof useSelectMethods> & {
    isHidden: (option: CommonProcessedOption) => boolean;
    isActive: (vm: ComponentInternalInstance) => boolean;
    activate: (vm: ComponentInternalInstance) => void;
    deactivate: () => void;
  }
>(getCollectorOptions('select', true));
