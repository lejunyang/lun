import { ComponentKey, GlobalStaticConfig } from '@lun-web/components';
import { createElement, HTMLAttributes, ReactNode } from 'react';

/*@__NO_SIDE_EFFECTS__*/
export default function <Props extends Record<string, any>, Instance extends HTMLElement>(
  compName: ComponentKey,
  defineFunc: () => void,
) {
  let name: string;
  return (({ children, ...reactProps }) => {
    defineFunc();
    name ||= GlobalStaticConfig.namespace + '-' + compName;
    return createElement(name, reactProps, children);
  }) as React.FC<Props & { ref?: React.Ref<Instance>; children?: ReactNode }> & HTMLAttributes<Instance>;
}
