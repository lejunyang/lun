import { defineCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { treeItemEmits, treeItemProps } from './type';
import { useExpose, useNamespace, useSlot, useCEStates } from 'hooks';
import { ElementWithExpose, getCompParts, getTransitionProps } from 'common';
import { TreeCollector } from './collector';
import { toGetterDescriptors, toPxIfNum } from '@lun-web/utils';
import { getCollectedItemTreeLevel, isCollectedItemLeaf, useSetupEdit } from '@lun-web/core';
import { computed, getCurrentInstance, Transition } from 'vue';
import { defineCheckbox } from '../checkbox';

const name = 'tree-item';
const parts = ['root', 'children', 'indent', 'label'] as const;
const compParts = getCompParts(name, parts);
export const TreeItem = defineCustomElement({
  name,
  props: treeItemProps,
  emits: treeItemEmits,
  setup(props) {
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();
    const vm = getCurrentInstance()!;
    const item = () => props._ || vm;

    const context = TreeCollector.child()!;
    if (__DEV__ && !context) throw new Error(name + ' must be under tree component');

    const { expand, select, check, parent } = context,
      parentProps = parent!.props;
    const expanded = computed(() => expand.isExpanded(props.value)),
      selected = computed(() => select.isSelected(props.value)),
      checked = computed(() => check.isChecked(props.value)),
      intermediate = computed(() => check.isIntermediate(props.value)),
      selectable = () => parentProps.selectable,
      isLabelSelectArea = () => parentProps.selectable === 'label',
      lineSelectable = () => selectable() && !isLabelSelectArea(),
      labelSelectable = () => selectable() && isLabelSelectArea(),
      checkable = () => parentProps.checkable;

    const performSelect = (e: MouseEvent) => {
      const method = parentProps.selectionMode === 'ctrl-multiple' && !e.ctrlKey ? 'clearAndSelect' : 'select';
      select[method](props.value);
    };
    const handleLineClick = (e: MouseEvent) => {
      if (!editComputed.disabled) {
        expand.toggle(props.value);
        if (lineSelectable()) performSelect(e);
        if (checkable()) check.check(props.value);
      }
    };
    const handleLabelClick = (e: MouseEvent) => {
      if (!editComputed.disabled) {
        if (labelSelectable()) performSelect(e);
      }
    };

    const checkboxHandlers = {
      onClick(e: MouseEvent) {
        e.stopPropagation();
        // check.toggle(props.value);
      },
      // do not toggle in click event, because it happens before type=checkbox input's change event.
      // checked -> true, change event happens, checked -> false. then external checked is true, but internal checkModel is false
      onUpdate() {
        check.toggle(props.value);
      },
    };

    useExpose({}, toGetterDescriptors(editComputed, ['disabled']));
    const [stateClass] = useCEStates(() => ({
      expanded,
      selected,
      checked,
      lineSelectable,
      labelSelectable,
    }));

    const [renderLabel] = useSlot('label', () => props.label);
    return () => {
      const { parent } = context,
        level = getCollectedItemTreeLevel(item())!,
        isLeaf = isCollectedItemLeaf(item());
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
              style={{ width: toPxIfNum(+(parent!.props.indentSize ?? 20) * (level + 1)) }}
            >
              {!isLeaf &&
                renderElement('icon', { name: 'down', class: [ns.e('toggle'), ns.is('expanded', expanded.value)] })}
            </div>
            {checkable() &&
              renderElement('checkbox', {
                checked: checked.value,
                intermediate: intermediate.value,
                class: ns.e('checkbox'),
                ...checkboxHandlers,
              })}
            <span part={compParts[3]} class={ns.e('label')} onClick={handleLabelClick}>
              {renderLabel()}
            </span>
          </li>
          <Transition {...getTransitionProps(props, 'expand', 'height')}>
            {!isLeaf && (
              <ul part={compParts[1]} v-content={expanded.value}>
                <slot></slot>
              </ul>
            )}
          </Transition>
        </>
      );
    };
  },
});

export type TreeItemExpose = {};
export type tTreeItem = ElementWithExpose<typeof TreeItem, TreeItemExpose>;
export type iTreeItem = InstanceType<tTreeItem>;

export const defineTreeItem = createDefineElement(name, TreeItem, {}, parts, [defineCheckbox]);
