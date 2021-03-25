// this ts-ignore is needed because we are using two tsconfig because we don't want to have jest global types is source code
// because of that typescript will complain about importing one to the other
// @ts-ignore
import { strings } from '.';

test('capitalize should be Test', () => {
	expect(strings.Capitalize('test')).toBe('Test');
	expect(strings.Capitalize('Test')).toBe('Test');
});

test('capitalize should be TeSt', () => {
	expect(strings.Capitalize('teSt')).toBe('TeSt');
});

test('capitalize should be empty string', () => {
	expect(strings.Capitalize('')).toBe('');
});

test('uncapitalize should be test', () => {
	expect(strings.Uncapitalize('Test')).toBe('test');
	expect(strings.Uncapitalize('test')).toBe('test');
});

test('uncapitalize should be teSt', () => {
	expect(strings.Uncapitalize('TeSt')).toBe('teSt');
});

test('uncapitalize should be empty string', () => {
	expect(strings.Uncapitalize('')).toBe('');
});
