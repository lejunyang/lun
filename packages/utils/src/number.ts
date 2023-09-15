export function isNumberEqual(num1: number, num2: number) {
	return Math.abs(num1 - num2) < Number.EPSILON; // 2^-52
}

export function toNumberIfValid<T>(val: T, defaultVal?: number) {
	const num = +val;
	return Number.isNaN(num) ? (defaultVal != null ? defaultVal : val) : num;
}

export function ensureNumber(val: any, defaultVal: number) {
	const num = +val;
	return Number.isNaN(num) ? (defaultVal != null ? defaultVal : num) : num;
}
