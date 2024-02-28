import { BigIntDecimal } from '../number';

describe('BigIntDecimal', () => {
  test('should correctly initialize from a number', () => {
    expect(new BigIntDecimal(123.45).toString()).toBe('123.45');
    expect(new BigIntDecimal(1.5e12).toString()).toBe('1500000000000');
  });

  test('should correctly initialize from a string', () => {
    expect(new BigIntDecimal('-123.45e-5').toString()).toBe('-0.0012345');
  });

  test('should correctly initialize from an object', () => {
    expect(new BigIntDecimal({ integer: '123', decimal: '0045' }).toString()).toBe('123.0045');
    expect(new BigIntDecimal({ integer: '123', decimal: '45', negative: true }).toString()).toBe('-123.45');
    expect(
      new BigIntDecimal({ integer: '123', decimal: '45', negative: true, exp: '5', expNegative: true }).toString(),
    ).toBe('-0.0012345');
  });

  test('should correctly handle addition', () => {
    const bigIntDecimal1 = new BigIntDecimal('123.45');
    const bigIntDecimal2 = new BigIntDecimal('678.90');
    const result = bigIntDecimal1.plus(bigIntDecimal2);
    expect(result.toString()).toBe('802.35');
  });

  test('should correctly handle subtraction', () => {
    const bigIntDecimal1 = new BigIntDecimal('123.45');
    const bigIntDecimal2 = new BigIntDecimal('678.90');
    const result = bigIntDecimal1.minus(bigIntDecimal2);
    expect(result.toString()).toBe('-555.45');
  });

  test('should correctly handle multiplication', () => {
    const bigIntDecimal1 = new BigIntDecimal('123.45');
    const bigIntDecimal2 = new BigIntDecimal('2');
    const result = bigIntDecimal1.multi(bigIntDecimal2);
    expect(result.toString()).toBe('246.9');
  });

  test('should correctly handle modulus', () => {
    const bigIntDecimal1 = new BigIntDecimal('123.45');
    const bigIntDecimal2 = new BigIntDecimal('2');
    const result = bigIntDecimal1.mod(bigIntDecimal2);
    expect(result.toString()).toBe('1.45');
  });

  test('should correctly handle equality', () => {
    const bigIntDecimal1 = new BigIntDecimal('123.45');
    const bigIntDecimal2 = new BigIntDecimal('123.45');
    expect(bigIntDecimal1.equals(bigIntDecimal2)).toBe(true);
  });

  test('should correctly handle less than', () => {
    const bigIntDecimal1 = new BigIntDecimal('123.45');
    const bigIntDecimal2 = new BigIntDecimal('678.90');
    expect(bigIntDecimal1.lessThan(bigIntDecimal2)).toBe(true);
  });

  test('should correctly handle greater than', () => {
    const bigIntDecimal1 = new BigIntDecimal('123.45');
    const bigIntDecimal2 = new BigIntDecimal('678.90');
    expect(bigIntDecimal1.greaterThan(bigIntDecimal2)).toBe(false);
  });

  test('should correctly convert to number', () => {
    const bigIntDecimal = new BigIntDecimal('123.45');
    expect(bigIntDecimal.toNumber()).toBe(123.45);
  });
});
