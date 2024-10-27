import {
  createSimpleExpression,
  NodeTypes,
  DirectiveNode,
  SimpleExpressionNode,
  createStructuralDirectiveTransform,
  CompoundExpressionNode,
} from '@vue/compiler-core';

/**
 * v-update-TARGET:FROM={EXPR} => TARGET={EXPR} onUpdate={(e) => EXPR = e.detail.FROM}
 *
 * EXPR must be a member expression, e.g. a.b.c a[0]
 *
 * Both TARGET and FROM are optional, Target defaults to 'value', FROM defaults to none(EXPR = e.detail)
 */

export const vUpdate = /*@__PURE__*/createStructuralDirectiveTransform(
  /update(-\w+)?/,
  (node, vUpdateDirective, _context) => {
    if (node.type !== NodeTypes.ELEMENT) {
      throw new Error(`v-update can only be used on element`);
    }
    const updateTarget = vUpdateDirective.name === 'update' ? 'value' : vUpdateDirective.name.slice(7);

    let { exp, arg } = vUpdateDirective;
    exp = exp as SimpleExpressionNode | CompoundExpressionNode;
    arg = arg as SimpleExpressionNode;
    if (!exp || (exp.type !== NodeTypes.SIMPLE_EXPRESSION && exp.type !== NodeTypes.COMPOUND_EXPRESSION)) {
      throw new Error('v-update requires an expression value');
    }

    const valueFrom = arg ? arg.content : '';
    const eventDetailMember = valueFrom[0] === '[' || !valueFrom ? valueFrom : `.${valueFrom}`;

    // v-bind
    const valueAttr: DirectiveNode = {
      type: NodeTypes.DIRECTIVE,
      name: 'bind',
      arg: createSimpleExpression(updateTarget, true),
      exp,
      loc: vUpdateDirective.loc,
      modifiers: [],
    };

    // v-on
    const updateAttr: DirectiveNode = {
      type: NodeTypes.DIRECTIVE,
      name: 'on',
      arg: createSimpleExpression('update', true),
      // exp can not be compound expression!!! will cause error in vue's transformOn
      exp: createSimpleExpression(`${exp.loc.source} = $event.detail${eventDetailMember}`, false),
      loc: vUpdateDirective.loc,
      modifiers: [],
    };

    node.props.push(valueAttr, updateAttr);
  },
);
