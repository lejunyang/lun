import * as babel from '@babel/core';
import { rUpdate } from '../../babel/rUpdate';

describe('vUpdate Babel Plugin', () => {
  const transform = (code: string) => {
    return babel.transform(code, {
      plugins: ['@babel/plugin-syntax-jsx', rUpdate],
      filename: 'testFile.ts',
    });
  };

  test('should handle r-update with array expression correctly', () => {
    const code = `<div r-update={[state, setState]}></div>`;
    const result = transform(code);
    expect(result?.code).toContain('value={state}');
    expect(result?.code).toContain('onUpdate={e => setState(e.detail)}');
  });

  test('should not handle r-updateOther', () => {
    const code = `<div r-updateOther={obj.prop}></div>`;
    const result = transform(code);
    expect(result?.code).toContain('<div r-updateOther={obj.prop}></div>');
  });

  test('should throw error when r-update requires an array expression', () => {
    const msg = 'r-update requires an array expression value containing [state, setState]';
    expect(() => transform(`<div r-update:foo={1 + 1}></div>`)).toThrow(msg);
    expect(() => transform(`<div r-update:foo={[]}></div>`)).toThrow(msg);
    expect(() => transform(`<div r-update:foo={[1, s]}></div>`)).toThrow(msg);
    expect(() => transform(`<div r-update:foo={[a, b, c]}></div>`)).toThrow(msg);
  });

  test('should handle r-update with update target correctly', () => {
    const code = `<div r-update:foo={[state, setState]}></div>`;
    const result = transform(code);
    expect(result?.code).toContain('value={state}');
    expect(result?.code).toContain('onUpdate={e => setState(e.detail.foo)}');
  });

  test('should handle r-update-xxx with update member correctly', () => {
    const code = `<div r-update-foo={[state, setState]}></div>`;
    const result = transform(code);
    expect(result?.code).toContain('foo={state}');
    expect(result?.code).toContain('onUpdate={e => setState(e.detail)}');
  });

  test('should handle r-update with both update target and update member correctly', () => {
    const code = `<div r-update-checked:checked={[state, setState]}></div>`;
    const result = transform(code);
    expect(result?.code).toContain('checked={state}');
    expect(result?.code).toContain('onUpdate={e => setState(e.detail.checked)}');
  });
});
