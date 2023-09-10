export function equal(num1: number, num2: number) {
	return Math.abs(num1 - num2) < Number.EPSILON; // 2^-52
}

export function toNumber<T>(val: T) {
	const num = +val;
	return Number.isNaN(num) ? val : num;
}
