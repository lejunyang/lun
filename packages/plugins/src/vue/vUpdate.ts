import { createSimpleExpression, createStructuralDirectiveTransform, NodeTypes } from '@vue/compiler-core';
import type { DirectiveNode, SimpleExpressionNode, CompoundExpressionNode } from '@vue/compiler-core';

/**
 * create a vue template directive to sync a certain property's value from a custom event like v-model, but only for custom-element
 * @param name the directive name, used for logging and error messages, e.g. v-update, v-update-value, v-update-model
 * @param regex the regex to match the directive, e.g. /update(-\w+)?/
 * @param getTarget a function to get the target property name from the directive, e.g. (directive) => directive.name.slice(7)
 * @param event the custom event name to listen to, e.g. update
 */
export const createCustomEventModel = ({
  name,
  regex,
  getTarget,
  event,
}: {
  name: string;
  regex: RegExp;
  getTarget: (directive: DirectiveNode) => string;
  event: string;
}) => {
  return createStructuralDirectiveTransform(regex, (node, vUpdateDirective, _context) => {
    if (node.type !== NodeTypes.ELEMENT) {
      throw new Error(`${name} can only be used on element`);
    }
    const updateTarget = getTarget(vUpdateDirective);

    let { exp, arg } = vUpdateDirective; // e.g. v-update:value="a.b.c", `a.b.c` is the exp, `value` is the arg
    exp = exp as SimpleExpressionNode | CompoundExpressionNode;
    arg = arg as SimpleExpressionNode;
    if (!exp || (exp.type !== NodeTypes.SIMPLE_EXPRESSION && exp.type !== NodeTypes.COMPOUND_EXPRESSION)) {
      throw new Error(`${name} requires an expression value`);
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
      arg: createSimpleExpression(event, true),
      // exp can not be compound expression!!! will cause error in vue's transformOn
      exp: createSimpleExpression(`${exp.loc.source} = $event.detail${eventDetailMember}`, false),
      loc: vUpdateDirective.loc,
      modifiers: [],
    };

    node.props.push(valueAttr, updateAttr);
  });
};

/**
 * v-update-TARGET:FROM={EXPR} => TARGET={EXPR} onUpdate={(e) => EXPR = e.detail.FROM}
 *
 * EXPR must be a member expression, e.g. a.b.c a[0]
 *
 * Both TARGET and FROM are optional, Target defaults to 'value', FROM defaults to none(EXPR = e.detail)
 */
export const vUpdate = /*@__PURE__*/ createCustomEventModel({
  name: 'v-update',
  regex: /update(-\w+)?/,
  getTarget: (directive) => {
    return directive.name === 'update' ? 'value' : directive.name.slice(7);
  },
  event: 'update',
});
