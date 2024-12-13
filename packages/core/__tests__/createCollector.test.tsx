import { effectScope } from 'vue';
import {
  getCollectedItemIndex,
  getCollectedItemTreeChildren,
  getCollectedItemTreeIndex,
  getCollectedItemTreeParent,
  isCollectedItemLeaf,
  useCollectorExternalChildren,
} from '../src/composable/createCollector';

const item1Children = [
  {
    label: 'Item 1.1',
    value: '1.1',
    children: [
      { label: 'Item 1.1.1', value: '1.1.1' },
      { label: 'Item 1.1.2', value: '1.1.2' },
      { label: 'Item 1.1.3', value: '1.1.3', disabled: true },
    ],
  },
  { label: 'Item 1.2', value: '1.2' },
  {
    label: 'Item 1.3',
    value: '1.3',
    children: [{ label: 'Item 1.3.1', value: '1.3.1' }],
  },
];
const items = [
  {
    label: 'Item 1',
    value: '1',
    children: item1Children,
  },
  {
    label: 'Item 2',
    value: '2',
  },
];

const item1ChildrenRemoveChildren = item1Children.map((item) => {
  const res = { ...item };
  delete res.children;
  return res;
});

describe('createCollector', () => {
  it('external object children', () => {
    const scope = effectScope();
    scope.run(() => {
      const [state] = useCollectorExternalChildren(
        () => items,
        () => undefined,
        () => undefined,
        true,
      );
      expect(state.treeItems).to.deep.equal([
        {
          label: 'Item 1',
          value: '1',
        },
        {
          label: 'Item 2',
          value: '2',
        },
      ]);
      expect(state.items[2]).to.deep.equal({ label: 'Item 1.1.1', value: '1.1.1' });
      expect(isCollectedItemLeaf(state.items[0])).to.be.false;
      expect(isCollectedItemLeaf(state.items[1])).to.be.false;
      expect(isCollectedItemLeaf(state.items[2])).to.be.true;
      expect(getCollectedItemTreeChildren(state.treeItems[0])).to.deep.equal(item1ChildrenRemoveChildren);
      expect(getCollectedItemTreeParent(state.items[2])).to.equal(state.items[1]); // must be Object.is equal, this is to test deep reactive, expect result is not wrapped by reactive
      state.items.forEach((item, i) => {
        expect(getCollectedItemIndex(item)).toBe(i);
      });
      const checkTreeIndex = (arr: any[]) => {
        arr.forEach((item, i) => {
          expect(getCollectedItemTreeIndex(item)).toBe(i);
          const children = getCollectedItemTreeChildren(item);
          if (children.length) {
            checkTreeIndex(children);
          }
        });
      };
      checkTreeIndex(state.treeItems);
    });
    scope.stop();
  });
});
