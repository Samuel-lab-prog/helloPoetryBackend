import { describe, it, expect } from 'bun:test';
import { toCamelCase, toPascalCase } from './execute';

describe('toCamelCase', () => {
	it('converts single-word kebab-case to camelCase', () => {
		expect(toCamelCase('hello-world')).toBe('helloWorld');
	});

	it('converts multi-word kebab-case to camelCase', () => {
		expect(toCamelCase('this-is-a-test')).toBe('thisIsATest');
	});

	it('leaves camelCase strings unchanged', () => {
		expect(toCamelCase('alreadyCamel')).toBe('alreadyCamel');
	});

	it('handles empty string', () => {
		expect(toCamelCase('')).toBe('');
	});

	it('handles strings with numbers and special characters', () => {
		expect(toCamelCase('version-2-update')).toBe('version2Update');
		expect(toCamelCase('foo-bar_baz')).toBe('fooBar_baz'); // underscore is preserved
	});

	it('handles strings starting with a dash', () => {
		expect(toCamelCase('-leading-dash')).toBe('LeadingDash');
	});
});

describe('toPascalCase', () => {
	it('converts single-word kebab-case to PascalCase', () => {
		expect(toPascalCase('hello-world')).toBe('HelloWorld');
	});

	it('converts multi-word kebab-case to PascalCase', () => {
		expect(toPascalCase('this-is-a-test')).toBe('ThisIsATest');
	});

	it('leaves PascalCase strings unchanged', () => {
		expect(toPascalCase('AlreadyPascal')).toBe('AlreadyPascal');
	});

	it('handles empty string', () => {
		expect(toPascalCase('')).toBe('');
	});

	it('handles strings with numbers and special characters', () => {
		expect(toPascalCase('version-2-update')).toBe('Version2Update');
		expect(toPascalCase('foo-bar_baz')).toBe('FooBar_baz');
	});

	it('handles strings starting with a dash', () => {
		expect(toPascalCase('-leading-dash')).toBe('LeadingDash');
	});
});
