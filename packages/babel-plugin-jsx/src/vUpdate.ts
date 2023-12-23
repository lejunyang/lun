import type * as BabelCore from '@babel/core';
import type * as BabelTypes from '@babel/types';

export default ({ types: t }: typeof BabelCore): BabelCore.PluginObj => {
  return {
    name: '@lun/babel-plugin-jsx-vUpdate',
    visitor: {
      JSXAttribute(path: BabelCore.NodePath<BabelTypes.JSXAttribute>) {
        const name = path.node.name;
        let valueProp = 'value';
        let eventDetailMember = '';
        const exprContainer = path.node.value;

        let updateTargetTemp = '';
        if (t.isJSXNamespacedName(name) && name.namespace.name.startsWith('v-update')) {
          // namespaced name is an attribute with ":" in it
          updateTargetTemp = name.namespace.name.substring(8);
          // name of namespace is string after ":"
          eventDetailMember = name.name.name; // v-update:checked => checked
        } else if (t.isJSXIdentifier(name) && name.name.startsWith('v-update')) {
          // attribute without ":" is an identifier
          updateTargetTemp = name.name.substring(8);
        } else return; // not v-update or v-update-xxx

        if (updateTargetTemp[0] === '-') valueProp = updateTargetTemp.substring(1);
        else if (updateTargetTemp) return; // v-updateXXX, ignore

        if (!t.isJSXExpressionContainer(exprContainer) || !t.isMemberExpression(exprContainer.expression)) {
          throw new Error('v-update requires a member expression value');
        }

        // value={expr}
        const valueAttr = t.jsxAttribute(
          t.jsxIdentifier(valueProp),
          t.jsxExpressionContainer(exprContainer.expression),
        );
        // onUpdate={(e) => expr = e.detail.value}
        const updateAttr = t.jsxAttribute(
          t.jsxIdentifier('onUpdate'),
          t.jsxExpressionContainer(
            t.arrowFunctionExpression(
              [t.identifier('e')],
              t.assignmentExpression(
                '=',
                exprContainer.expression,
                eventDetailMember
                  ? t.memberExpression(
                      t.memberExpression(t.identifier('e'), t.identifier('detail')),
                      t.identifier(eventDetailMember),
                    )
                  : t.memberExpression(t.identifier('e'), t.identifier('detail')),
              ),
            ),
          ),
        );

        path.replaceWithMultiple([valueAttr, updateAttr]);
      },
    },
  };
};
