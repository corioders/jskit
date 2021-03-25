// this ts-ignore is needed because we are using two tsconfig because we don't want to have jest global types is source code
// because of that typescript will complain about importing one to the other
// @ts-ignore
import { random } from '.';

test('random int should be >= 10 & <= 12', () => {
	const rand = random.getRandomInt(10, 12);
	expect(rand).toBeGreaterThanOrEqual(10);
	expect(rand).toBeLessThanOrEqual(12);
});

test('random int should be 25', () => {
	expect(random.getRandomInt(25, 25)).toBe(25);
});

test('random int should throw error', () => {
	expect(() => random.getRandomInt(50, 49)).toThrowError();
});
