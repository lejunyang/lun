import { BigIntDecimal } from '../src/number';

describe('BigIntDecimal', () => {
  test('should correctly initialize from a number', () => {
    expect(new BigIntDecimal(123.45).toString()).toBe('123.45');
    expect(new BigIntDecimal(1.5e12).toString()).toBe('1500000000000');
  });

  test('should correctly initialize from a string', () => {
    expect(new BigIntDecimal('-123.45e-5').toString()).toBe('-0.0012345');
    expect(new BigIntDecimal('-123.45e-3').toString()).toBe('-0.12345');
    expect(new BigIntDecimal('-123.45e3').toString()).toBe('-123450');
    expect(new BigIntDecimal('-123.45e-0').toString()).toBe('-123.45');
    expect(new BigIntDecimal('123.45e').toString()).toBe('123.45');
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
    expect(new BigIntDecimal(1).plus(0).toString()).toBe('1');
    expect(new BigIntDecimal(1).plus(2).toString()).toBe('3');
  });

  test('should correctly handle subtraction', () => {
    const bigIntDecimal1 = new BigIntDecimal('123.45');
    const bigIntDecimal2 = new BigIntDecimal('678.90');
    const result = bigIntDecimal1.minus(bigIntDecimal2);
    expect(result.toString()).toBe('-555.45');
    const bigIntDecimal3 = new BigIntDecimal('0.001');
    const bigIntDecimal4 = new BigIntDecimal('0.004');
    const result2 = bigIntDecimal3.minus(bigIntDecimal4);
    expect(result2.toString()).toBe('-0.003');
  });

  test('should correctly handle multiplication', () => {
    expect(new BigIntDecimal(3).multi(2).toString()).toBe('6');
    const bigIntDecimal1 = new BigIntDecimal('123.45');
    const bigIntDecimal2 = new BigIntDecimal('2');
    const result = bigIntDecimal1.multi(bigIntDecimal2);
    expect(result.toString()).toBe('246.9');
  });

  test('should correctly handle modulus', () => {
    expect(new BigIntDecimal(5).mod(3).toString()).toBe('2');
    expect(new BigIntDecimal(-5).mod(3).toString()).toBe('-2');
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
    expect(bigIntDecimal1.lessThan(null as any)).toBe(false);
    expect(bigIntDecimal1.lessThan(undefined as any)).toBe(false);
    expect(bigIntDecimal1.lessThan(NaN)).toBe(false);
  });

  test('should correctly handle greater than', () => {
    const bigIntDecimal1 = new BigIntDecimal('123.45');
    const bigIntDecimal2 = new BigIntDecimal('678.90');
    expect(bigIntDecimal1.greaterThan(bigIntDecimal2)).toBe(false);
    expect(bigIntDecimal1.greaterThan(null as any)).toBe(false);
    expect(bigIntDecimal1.greaterThan(undefined as any)).toBe(false);
    expect(bigIntDecimal1.greaterThan(NaN)).toBe(false);
  });

  test('should correctly convert to number', () => {
    const bigIntDecimal = new BigIntDecimal('123.45');
    expect(bigIntDecimal.toNumber()).toBe(123.45);
  });

  it('should correctly round to the specified precision', () => {
    const decimal = new BigIntDecimal('123.456');
    expect(decimal.toPrecision(2).toString()).toBe('123.46');
    expect(decimal.toPrecision(1).toString()).toBe('123.5');
    expect(decimal.toPrecision(0).toString()).toBe('123');
    expect(decimal.toPrecision(1).toPrecision(0).toString()).toBe('124');
  });

  it('should handle negative numbers', () => {
    const decimal = new BigIntDecimal('-123.456');
    expect(decimal.toPrecision(2).toString()).toBe('-123.46');
    expect(decimal.toPrecision(1).toString()).toBe('-123.5');
    expect(decimal.toPrecision(0).toString()).toBe('-123');
  });

  it('should handle numbers with no decimal part', () => {
    const decimal = new BigIntDecimal('123');
    expect(decimal.toPrecision(1).toString()).toBe('123');
    expect(decimal.toPrecision(0).toString()).toBe('123');
  });

  it('should handle numbers with no integer part', () => {
    const decimal = new BigIntDecimal('.456');
    expect(decimal.toPrecision(2).toString()).toBe('0.46');
    expect(decimal.toPrecision(1).toString()).toBe('0.5');
    expect(decimal.toPrecision(0).toString()).toBe('0');
  });

  it('should handle infinity', () => {
    const decimal = new BigIntDecimal('Infinity');
    expect(decimal.negated().toString()).toBe('-Infinity');
    expect(decimal.toPrecision(2).toString()).toBe('Infinity');
  });

  it('should handle NaN', () => {
    const decimal = new BigIntDecimal('NaN');
    expect(decimal.negated().toString()).toBe('');
    expect(decimal.toPrecision(2).toString()).toBe('');
  });
});
