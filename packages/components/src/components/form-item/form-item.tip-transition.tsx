import { getTransitionProps } from 'common';
import { setHeightVar } from 'utils';
import { ComputedRef, TransitionGroup } from 'vue';

export function wrapTransition(nodes: any, props: ComputedRef<{ tipTransition: any }>, otherProps?: any) {
  return (
    <TransitionGroup
      {...otherProps}
      {...getTransitionProps(props.value, 'tip', 'tips')}
      onEnter={setHeightVar} // set a var for height transition, though we don't use it for now
      onLeave={setHeightVar}
      tag="div"
    >
      {nodes}
    </TransitionGroup>
  );
}
