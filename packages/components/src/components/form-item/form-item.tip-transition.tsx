import { getTransitionProps } from 'common';
import { ComputedRef, TransitionGroup } from 'vue';

export function wrapTransition(nodes: any, props: ComputedRef<{ tipTransition: any }>, otherProps?: any) {
  return (
    <TransitionGroup
      {...otherProps}
      {...getTransitionProps(props.value, 'tip', 'tips')}
      // {...heightTransitionHandlers} // it's moved to getTransitionProps
      tag="div"
    >
      {nodes}
    </TransitionGroup>
  );
}
