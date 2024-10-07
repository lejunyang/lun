import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { treeItemEmits, treeItemProps } from './type';
import { defineIcon } from '../icon/Icon';
import { useExpose, useNamespace, useSlot, useCEStates, useCEExpose } from 'hooks';
import { getCompParts, getTransitionProps } from 'common';
import { TreeCollector } from './collector';
import { toGetterDescriptors, toPxIfNum } from '@lun/utils';
import { useSetupEdit } from '@lun/core';
import { computed, Transition } from 'vue';

const name = 'tree-item';
const parts = ['root', 'children', 'indent', 'label'] as const;
const compParts = getCompParts(name, parts);
export const TreeItem = defineSSRCustomElement({
  name,
  props: treeItemProps,
  emits: treeItemEmits,
  setup(props) {
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();

    const context = TreeCollector.child()!;
    if (__DEV__ && !context) throw new Error(name + ' must be under tree component');

    const { expand, select, check, parent } = context,
      parentProps = parent!.props;
    const expanded = computed(() => expand.isExpanded(props.value)),
      selected = computed(() => select.isSelected(props.value)),
      checked = computed(() => check.isChecked(props.value)),
      selectable = () => parentProps.selectable,
      isLabelSelectArea = () => parentProps.selectable === 'label',
      lineSelectable = () => selectable() && !isLabelSelectArea(),
      labelSelectable = () => selectable() && isLabelSelectArea(),
      checkable = () => parentProps.checkable;

    const performSelect = (e: MouseEvent) => {
      const method = parentProps.selectMode === 'ctrl-multiple' && !e.ctrlKey ? 'clearAndSelect' : 'select';
      select[method](props.value);
    };
    const handleLineClick = (e: MouseEvent) => {
      if (!editComputed.disabled) {
        expand.toggleExpand(props.value);
        if (lineSelectable()) performSelect(e);
        if (checkable()) check.check(props.value);
      }
    };
    const handleLabelClick = (e: MouseEvent) => {
      if (!editComputed.disabled) {
        if (labelSelectable()) performSelect(e);
      }
    };

    const contextDesc = toGetterDescriptors(context, ['level', 'isLeaf']);
    useExpose(
      {},
      {
        ...contextDesc,
        ...toGetterDescriptors(editComputed, ['disabled']),
      },
    );
    useCEExpose({}, contextDesc);
    const [stateClass] = useCEStates(
      () => ({
        expanded,
        selected,
        checked,
        lineSelectable,
        labelSelectable,
      }),
      ns,
    );

    const [renderLabel] = useSlot('label', () => props.label);
    return () => {
      const { level, isLeaf, parent } = context;
      return (
        <>
          <li
            class={stateClass.value}
            part={compParts[0]}
            data-root={level === 0}
            data-level={level}
            onClick={handleLineClick}
          >
            <div
              class={ns.e('indent')}
              part={compParts[2]}
              // TODO level - 1 if all this level tree-items have no children
              style={{ width: toPxIfNum(+(parent!.props.indentSize || 0) * (level + 1)) }}
            >
              {!isLeaf &&
                renderElement('icon', { name: 'down', class: [ns.e('toggle'), ns.is('expanded', expanded.value)] })}
            </div>
            <span part={compParts[3]} class={ns.e('label')} onClick={handleLabelClick}>
              {renderLabel()}
            </span>
          </li>
          <Transition {...getTransitionProps(props, 'expand', 'height')}>
            {!isLeaf && (
              <ul part={compParts[1]} v-show={expanded.value}>
                <slot></slot>
              </ul>
            )}
          </Transition>
        </>
      );
    };
  },
});

export type tTreeItem = typeof TreeItem;
export type iTreeItem = InstanceType<tTreeItem>;

export const defineTreeItem = createDefineElement(name, TreeItem, {}, parts, {
  icon: defineIcon,
});
