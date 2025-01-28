import {
  baseParse,
  transform,
  transformElement,
  transformBind,
  transformOn,
  BaseElementNode,
  DirectiveNode,
} from '@vue/compiler-core';
import { vUpdate } from '../../vue/vUpdate';

describe('vue vUpdate', () => {
  it('vUpdate template', () => {
    const source = `<div v-update="state.value"></div>`;
    const ast = baseParse(source);
    transform(ast, {
      nodeTransforms: [transformElement, vUpdate],
      directiveTransforms: {
        bind: transformBind,
        on: transformOn,
      },
    });
    const node = ast.children[0] as BaseElementNode;

    expect(node.props.length).to.equal(2);
    expect(node.props[0].name).toBe('bind');
    expect((node.props[0] as DirectiveNode).arg).to.include({
      content: 'value',
    });
    expect((node.props[0] as DirectiveNode).exp).to.include({
      content: 'state.value',
    });
    expect(node.props[1].name).toBe('on');
    expect((node.props[1] as DirectiveNode).arg).to.include({
      content: 'update',
    });
    expect((node.props[1] as DirectiveNode).exp).to.include({
      content: 'state.value = $event.detail',
    });
  });
});
