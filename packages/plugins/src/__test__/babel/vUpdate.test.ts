import * as babel from '@babel/core';
import { vUpdate } from '../../babel/vUpdate';

describe('vUpdate Babel Plugin', () => {
  const transform = (code: string) => {
    return babel.transform(code, {
      plugins: ['@babel/plugin-syntax-jsx', vUpdate],
      filename: 'testFile.ts',
    });
  };

  test('should handle v-update with array expression correctly', () => {
    const code = `<div v-update={arr[0]}></div>`;
    const result = transform(code);
    expect(result?.code).toContain('value={arr[0]}');
    expect(result?.code).toContain('onUpdate={e => arr[0] = e.detail}');
  });

  test('should not handle v-updateOther', () => {
    const code = `<div v-updateOther={obj.prop}></div>`;
    const result = transform(code);
    expect(result?.code).toContain('<div v-updateOther={obj.prop}></div>');
  });

  test('should throw error when v-update requires a member expression', () => {
    const code = `<div v-update:foo={1 + 1}></div>`;
    expect(() => transform(code)).toThrow('v-update requires a member expression value');
  });

  test('should handle v-update with update target correctly', () => {
    const code = `<div v-update:foo={obj.prop}></div>`;
    const result = transform(code);
    expect(result?.code).toContain('value={obj.prop}');
    expect(result?.code).toContain('onUpdate={e => obj.prop = e.detail.foo}');
  });

  test('should handle v-update-xxx with update member correctly', () => {
    const code = `<div v-update-foo={obj.prop}></div>`;
    const result = transform(code);
    expect(result?.code).toContain('foo={obj.prop}');
    expect(result?.code).toContain('onUpdate={e => obj.prop = e.detail}');
  });

  test('should handle v-update with both update target and update member correctly', () => {
    const code = `<div v-update-checked:checked={obj.prop}></div>`;
    const result = transform(code);
    expect(result?.code).toContain('checked={obj.prop}');
    expect(result?.code).toContain('onUpdate={e => obj.prop = e.detail.checked}');
  });
});
