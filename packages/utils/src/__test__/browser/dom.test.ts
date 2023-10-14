/**
 * @vitest-environment happy-dom
 */

import {
  createGetNodeInTree,
  getPreviousMatchElInTree,
  getPreviousMatchNodeInTree,
  getNextMatchElInTree,
  getNextMatchNodeInTree,
} from '../../browser/dom';

describe('createGetNodeInTree', () => {
  const root = document.createElement('div');
  const child1 = document.createElement('div');
  const child2 = document.createElement('div');
  const grandchild1 = document.createElement('div');
  const grandchild2 = document.createElement('div');
  const greatGrandchild1 = document.createElement('div');
  const greatGrandchild2 = document.createElement('div');

  root.appendChild(child1);
  root.appendChild(child2);
  child1.appendChild(grandchild1);
  child2.appendChild(grandchild2);
  grandchild1.appendChild(greatGrandchild1);
  grandchild2.appendChild(greatGrandchild2);

  test('returns null when no element is provided', () => {
    expect(createGetNodeInTree({ getNext: vi.fn(), getParent: vi.fn(), getNextFromParent: vi.fn() })()).toBeNull();
  });

  test('returns null when no matching element is found', () => {
    const getNext = vi.fn().mockReturnValue(null);
    const getParent = vi.fn().mockReturnValue(null);
    const getNextFromParent = vi.fn().mockReturnValue(null);
    const getNodeInTree = createGetNodeInTree({ getNext, getParent, getNextFromParent });

    expect(getNodeInTree(root)).toBeNull();
    expect(getNext).toHaveBeenCalledTimes(1);
    expect(getParent).toHaveBeenCalledTimes(1);
    expect(getNextFromParent).toHaveBeenCalledTimes(0);
  });

  test('returns the matching element when found', () => {
    const getNext = vi.fn().mockReturnValue(child1);
    const getParent = vi.fn().mockReturnValue(null);
    const getNextFromParent = vi.fn().mockReturnValue(null);
    const getNodeInTree = createGetNodeInTree({ getNext, getParent, getNextFromParent });

    expect(getNodeInTree(root)).toBe(child1);
    expect(getNext).toHaveBeenCalledTimes(1);
    expect(getParent).toHaveBeenCalledTimes(0);
    expect(getNextFromParent).toHaveBeenCalledTimes(0);
  });

  test('stops searching when shouldStop condition is met', () => {
    const getNext = vi.fn().mockReturnValue(child1);
    const getParent = vi.fn().mockReturnValue(root);
    const getNextFromParent = vi.fn().mockReturnValue(null);
    const shouldStop = vi.fn().mockReturnValue(true);
    const getNodeInTree = createGetNodeInTree({ getNext, getParent, getNextFromParent });

    expect(getNodeInTree(grandchild1, { shouldStop })).toBeNull();
    expect(getNext).toHaveBeenCalledTimes(1);
    expect(getParent).toHaveBeenCalledTimes(1);
    expect(getNextFromParent).toHaveBeenCalledTimes(0);
    expect(shouldStop).toHaveBeenCalledTimes(1);
  });

  test('returns the next matching element when found', () => {
    const getNext = vi.fn().mockReturnValue(child1);
    const getParent = vi.fn().mockReturnValue(root);
    const getNextFromParent = vi.fn().mockReturnValue(child2);
    const isMatch = vi.fn().mockReturnValue(false).mockReturnValueOnce(true);
    const getNodeInTree = createGetNodeInTree({ getNext, getParent, getNextFromParent });

    expect(getNodeInTree(grandchild1, { isMatch })).toBe(child2);
    expect(getNext).toHaveBeenCalledTimes(1);
    expect(getParent).toHaveBeenCalledTimes(1);
    expect(getNextFromParent).toHaveBeenCalledTimes(1);
    expect(isMatch).toHaveBeenCalledTimes(2);
  });
});

describe('getPreviousMatchElInTree', () => {
  const root = document.createElement('div');
  const child1 = document.createElement('div');
  const child2 = document.createElement('div');
  const grandchild1 = document.createElement('div');
  const grandchild2 = document.createElement('div');
  const greatGrandchild1 = document.createElement('div');
  const greatGrandchild2 = document.createElement('div');

  root.appendChild(child1);
  root.appendChild(child2);
  child1.appendChild(grandchild1);
  child2.appendChild(grandchild2);
  grandchild1.appendChild(greatGrandchild1);
  grandchild2.appendChild(greatGrandchild2);

  test('returns null when no previous matching element is found', () => {
    const isMatch = vi.fn().mockReturnValue(false);
    expect(getPreviousMatchElInTree(greatGrandchild1, { isMatch })).toBeNull();
    expect(isMatch).toHaveBeenCalledTimes(1);
  });

  test('returns the previous matching element when found', () => {
    const isMatch = vi.fn().mockReturnValue(false).mockReturnValueOnce(true);
    expect(getPreviousMatchElInTree(greatGrandchild2, { isMatch })).toBe(grandchild2);
    expect(isMatch).toHaveBeenCalledTimes(2);
  });
});

describe('getPreviousMatchNodeInTree', () => {
  const root = document.createElement('div');
  const child1 = document.createElement('div');
  const child2 = document.createElement('div');
  const grandchild1 = document.createElement('span');
  const grandchild2 = document.createElement('span');
  const greatGrandchild1 = document.createElement('span');
  const greatGrandchild2 = document.createElement('span');

  root.appendChild(child1);
  root.appendChild(child2);
  child1.appendChild(grandchild1);
  child2.appendChild(grandchild2);
  grandchild1.appendChild(greatGrandchild1);
  grandchild2.appendChild(greatGrandchild2);

  test('returns null when no previous matching node is found', () => {
    const isMatch = vi.fn().mockReturnValue(false);
    expect(getPreviousMatchNodeInTree(greatGrandchild1, { isMatch })).toBeNull();
    expect(isMatch).toHaveBeenCalledTimes(1);
  });

  test('returns the previous matching node when found', () => {
    const isMatch = vi.fn().mockReturnValue(false).mockReturnValueOnce(true);
    expect(getPreviousMatchNodeInTree(greatGrandchild2, { isMatch })).toBe(grandchild2);
    expect(isMatch).toHaveBeenCalledTimes(2);
  });
});

describe('getNextMatchElInTree', () => {
  const root = document.createElement('div');
  const child1 = document.createElement('div');
  const child2 = document.createElement('div');
  const grandchild1 = document.createElement('div');
  const grandchild2 = document.createElement('div');
  const greatGrandchild1 = document.createElement('div');
  const greatGrandchild2 = document.createElement('div');

  root.appendChild(child1);
  root.appendChild(child2);
  child1.appendChild(grandchild1);
  child2.appendChild(grandchild2);
  grandchild1.appendChild(greatGrandchild1);
  grandchild2.appendChild(greatGrandchild2);

  test('returns null when no next matching element is found', () => {
    const isMatch = vi.fn().mockReturnValue(false);
    expect(getNextMatchElInTree(greatGrandchild2, { isMatch })).toBeNull();
    expect(isMatch).toHaveBeenCalledTimes(1);
  });

  test('returns the next matching element when found', () => {
    const isMatch = vi.fn().mockReturnValue(false).mockReturnValueOnce(true);
    expect(getNextMatchElInTree(grandchild1, { isMatch })).toBe(greatGrandchild1);
    expect(isMatch).toHaveBeenCalledTimes(2);
  });
});

describe('getNextMatchNodeInTree', () => {
  const root = document.createElement('div');
  const child1 = document.createElement('div');
  child1.id = 'c1';
  const child2 = document.createElement('div');
  child2.id = 'c2';
  const grandchild1 = document.createElement('span');
  grandchild1.id = 's1';
  const grandchild2 = document.createElement('span');
  grandchild2.id = 's2';
  const greatGrandchild1 = document.createElement('span');
  const greatGrandchild2 = document.createElement('span');

  root.appendChild(child1);
  root.appendChild(child2);
  child1.appendChild(grandchild1);
  child2.appendChild(grandchild2);
  grandchild1.appendChild(greatGrandchild1);
  grandchild2.appendChild(greatGrandchild2);

  test('returns null when no next matching node is found', () => {
    const isMatch = vi.fn().mockReturnValue(false);
    expect(getNextMatchNodeInTree(greatGrandchild2, { isMatch })).toBeNull();
    expect(isMatch).toHaveBeenCalledTimes(3);
  });

  test('returns the next matching node when found', () => {
    const isMatch = vi.fn((el) => el.id.startsWith('s'));
    expect(getNextMatchNodeInTree(grandchild1, { isMatch })).toBe(grandchild2);
    expect(isMatch).toHaveBeenCalledTimes(2);
  });
});
