import { ComponentKey, getElementFirstName } from '@lun-web/components';
import { createElement, ReactNode } from 'react';

/*@__NO_SIDE_EFFECTS__*/
export default function <Props extends Record<string, any>, Instance extends HTMLElement>(
  compName: ComponentKey,
  defineFunc: () => void,
) {
  return (({ children, ...reactProps }) => {
    defineFunc();
    const name = getElementFirstName(compName) as string;
    if (!name) throw new Error(__DEV__ ? 'Invalid component name' : '');
    return createElement(name, reactProps, children);
  }) as React.FC<Props & { ref?: React.Ref<Instance>; children?: ReactNode }>;
}
