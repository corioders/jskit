export function getRandomInt(min: number, max: number): number {
	if (min > max) throw 'min is greater than max';
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min); // <min ,max>
}
