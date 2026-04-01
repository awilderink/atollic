/// <reference types="vite/client" />

declare module "idiomorph" {
	export const Idiomorph: {
		morph(
			oldNode: Element,
			newContent: Element | string,
			config?: {
				morphStyle?: "innerHTML" | "outerHTML";
				ignoreActive?: boolean;
				ignoreActiveValue?: boolean;
				head?: { style?: "merge" | "append" | "morph" | "none" };
				callbacks?: Record<string, (...args: unknown[]) => unknown>;
			},
		): void;
	};
}
