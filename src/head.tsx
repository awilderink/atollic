/**
 * Returns the marker tag for atollic asset injection.
 * Place this in your document `<head>` — the framework replaces it
 * with the actual CSS and script tags.
 *
 * @example
 * ```tsx
 * <head>
 *   <meta charset="UTF-8" />
 *   <Head />
 * </head>
 * ```
 */
export function Head(_props?: {}): string {
	return <meta name="atollic-head" />;
}
