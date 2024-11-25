import type * as BabelCore from '@babel/core';
import type * as BabelTypes from '@babel/types';

/**
 * similar v-update for react.
 * const [state, setState] = useState();
 * r-update-TARGET:FROM={[state, setState]} => TARGET={state} onUpdate={(e) => setState(e.detail.FROM)}
 *
 * Both TARGET and FROM are optional, Target defaults to 'value', FROM defaults to none( setState(e.detail) )
 */
export const rUpdate = ({ types: t }: typeof BabelCore): BabelCore.PluginObj => {
  return {
    name: '@lun-web/babel-plugin-jsx-rUpdate',
    visitor: {
      JSXAttribute(path: BabelCore.NodePath<BabelTypes.JSXAttribute>) {
        const name = path.node.name;
        let valueProp = 'value';
        let eventDetailMember = '';
        const exprContainer = path.node.value;

        let updateTargetTemp = '';
        if (t.isJSXNamespacedName(name) && name.namespace.name.startsWith('r-update')) {
          // namespaced name is an attribute with ":" in it
          updateTargetTemp = name.namespace.name.substring(8);
          // name of namespace is string after ":"
          eventDetailMember = name.name.name; // r-update:checked => checked
        } else if (t.isJSXIdentifier(name) && name.name.startsWith('r-update')) {
          // attribute without ":" is an identifier
          updateTargetTemp = name.name.substring(8);
        } else return; // not r-update or r-update-xxx

        if (updateTargetTemp[0] === '-') valueProp = updateTargetTemp.substring(1);
        else if (updateTargetTemp) return; // r-updateXXX, ignore

        if (
          !t.isJSXExpressionContainer(exprContainer) ||
          !t.isArrayExpression(exprContainer.expression) ||
          exprContainer.expression.elements.length !== 2 ||
          !t.isIdentifier(exprContainer.expression.elements[0]) ||
          !t.isIdentifier(exprContainer.expression.elements[1])
        ) {
          throw new Error('r-update requires an array expression value containing [state, setState]');
        }

        // value={state}
        const valueAttr = t.jsxAttribute(
          t.jsxIdentifier(valueProp),
          t.jsxExpressionContainer(exprContainer.expression.elements[0]),
        );
        // onUpdate={(e) => setState(e.detail.value)}
        const updateAttr = t.jsxAttribute(
          t.jsxIdentifier('onUpdate'),
          t.jsxExpressionContainer(
            t.arrowFunctionExpression(
              [t.identifier('e')],
              t.callExpression(exprContainer.expression.elements[1], [
                eventDetailMember
                  ? t.memberExpression(
                      t.memberExpression(t.identifier('e'), t.identifier('detail')),
                      t.identifier(eventDetailMember),
                    )
                  : t.memberExpression(t.identifier('e'), t.identifier('detail')),
              ]),
            ),
          ),
        );

        path.replaceWithMultiple([valueAttr, updateAttr]);
      },
    },
  };
};
