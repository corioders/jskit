export function Capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.substring(1);
}

export function Uncapitalize(s: string): string {
	return s.charAt(0).toLocaleLowerCase() + s.substring(1);
}
