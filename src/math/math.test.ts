// this ts-ignore is needed because we are using two tsconfig because we don't want to have jest global types is source code
// because of that typescript will complain about importing one to the other
// @ts-ignore
import { math } from '.';

test('distance should be 5', () => {
	expect(math.pythagorasDistance(0, 0, 3, 4)).toBe(5);
	expect(math.pythagorasDistance(2, 1, 5, 5)).toBe(5);
});
