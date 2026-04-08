/**
 * Client-side island runtime for atollic.
 *
 * Discovers [data-island] elements in the DOM, dynamically imports
 * the corresponding component, and mounts it using the registered
 * framework adapter. Handles cleanup on removal and HMR.
 *
 * Events (on `document`):
 * - `atollic:ready`           — all initial islands mounted
 * - `atollic:before-morph`    — cancelable, detail: { newDoc, mountedIslands }
 * - `atollic:after-morph`     — detail: { defaultSwap }, after HMR page replacement
 */

// Lazy-loaded — only needed when morphPage runs with default swap
let _idiomorphPromise: Promise<typeof import("idiomorph").Idiomorph> | null =
	null;
function getIdiomorph() {
	if (!_idiomorphPromise) {
		_idiomorphPromise = import("idiomorph").then((mod) => mod.Idiomorph);
	}
	return _idiomorphPromise;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ISLAND_ATTR = "data-island";
const ISLAND_SELECTOR = `[${ISLAND_ATTR}]`;
const HMR_RELOAD_EVENT = "atollic:reload";

// ---------------------------------------------------------------------------
// Framework runtime registry
// ---------------------------------------------------------------------------

type HydrateFn = (
	el: HTMLElement,
	// biome-ignore lint/suspicious/noExplicitAny: component type varies per framework
	Component: any,
	props: Record<string, unknown>,
	id: string,
) => () => void;

type RenderFn = (
	el: HTMLElement,
	// biome-ignore lint/suspicious/noExplicitAny: component type varies per framework
	Component: any,
	props: Record<string, unknown>,
) => () => void;

interface FrameworkRuntime {
	hydrate: HydrateFn;
	render: RenderFn;
}

const frameworks = new Map<string, FrameworkRuntime>();

export function registerFramework(
	name: string,
	hydrate: HydrateFn,
	render: RenderFn,
): void {
	frameworks.set(name, { hydrate, render });
}

// ---------------------------------------------------------------------------
// Island registry
// ---------------------------------------------------------------------------

// biome-ignore lint/suspicious/noExplicitAny: island components accept arbitrary props
type IslandLoader = () => Promise<{ default: (props: any) => any }>;

interface IslandEntry {
	framework: string;
	loader: IslandLoader;
}

const registry = new Map<string, IslandEntry>();

interface MountedIsland {
	dispose: () => void;
	name: string;
	// biome-ignore lint/suspicious/noExplicitAny: island props are arbitrary
	props: Record<string, any>;
}

const mounted = new Map<HTMLElement, MountedIsland>();

/** Elements mid-mount — blocks concurrent mountIslands calls from double-rooting the same el. */
const pending = new Set<HTMLElement>();

/**
 * Islands present in the DOM before any JS ran. Only these get `hydrateIsland`
 * so that their SSR-rendered DOM is reused. All dynamically inserted islands
 * (htmx swaps, MutationObserver, etc.) use `renderIsland` — their hydration
 * records are not in `_$HY` and `_hydrate` would silently produce a
 * non-interactive result.
 */
const ssrIslands = new Set<HTMLElement>();

/** When true, the MutationObserver skips island mounting (morphPage handles it). */
let replacing = false;

export function registerIsland(
	name: string,
	framework: string,
	loader: IslandLoader,
): void {
	registry.set(name, { framework, loader });
}

// ---------------------------------------------------------------------------
// Mount / Dispose
// ---------------------------------------------------------------------------

function disposeIsland(el: HTMLElement): void {
	const entry = mounted.get(el);
	if (entry) {
		entry.dispose();
		mounted.delete(el);
	}
}

export async function mountIslands(
	root: Element | Document = document,
): Promise<void> {
	// querySelectorAll returns document order, so parents come before children.
	const els = Array.from(root.querySelectorAll<HTMLElement>(ISLAND_SELECTOR));

	interface PreparedIsland {
		el: HTMLElement;
		// biome-ignore lint/suspicious/noExplicitAny: component type varies per framework
		Component: any;
		props: Record<string, unknown>;
		name: string;
		fw: FrameworkRuntime;
		hasSSR: boolean;
	}

	const prepared: (PreparedIsland | null)[] = await Promise.all(
		els.map(async (el): Promise<PreparedIsland | null> => {
			if (mounted.has(el) || pending.has(el)) return null;

			const name = el.getAttribute(ISLAND_ATTR);
			if (!name) return null;

			const entry = registry.get(name);
			if (!entry) {
				console.warn(`[atollic] Unknown island: "${name}"`);
				return null;
			}

			const fw = frameworks.get(entry.framework);
			if (!fw) {
				console.warn(
					`[atollic] Unknown framework "${entry.framework}" for island "${name}"`,
				);
				return null;
			}

			pending.add(el);
			try {
				const script = el.querySelector<HTMLScriptElement>(
					':scope > script[type="application/json"]',
				);
				const props = script ? JSON.parse(script.textContent || "{}") : {};
				if (script) script.remove();
				const hasSSR = ssrIslands.has(el) && el.childNodes.length > 0;
				const mod = await entry.loader();
				return { el, Component: mod.default, props, name, fw, hasSSR };
			} catch (err) {
				console.error(`[atollic] Failed to prepare island "${name}":`, err);
				pending.delete(el);
				return null;
			}
		}),
	);

	// Serial mount in depth order: parent render may tear out nested island
	// DOM, so by the time we reach a child its el.isConnected is false.
	for (const p of prepared) {
		if (!p) continue;
		try {
			if (!p.el.isConnected) continue;
			let dispose: () => void;
			if (p.hasSSR && p.el.id) {
				dispose = p.fw.hydrate(p.el, p.Component, p.props, p.el.id);
			} else {
				dispose = p.fw.render(p.el, p.Component, p.props);
			}
			mounted.set(p.el, { dispose, name: p.name, props: p.props });
		} catch (err) {
			console.error(`[atollic] Failed to mount island "${p.name}":`, err);
		} finally {
			pending.delete(p.el);
		}
	}
}

export function disposeIslands(root: Element | Document = document): void {
	for (const el of root.querySelectorAll<HTMLElement>(ISLAND_SELECTOR)) {
		disposeIsland(el);
	}
}

// ---------------------------------------------------------------------------
// DOM replacement for server-side HMR
// ---------------------------------------------------------------------------

async function morphPage(newHtml: string): Promise<void> {
	const parser = new DOMParser();
	const newDoc = parser.parseFromString(newHtml, "text/html");

	replacing = true;

	// Fire before-morph — cancelable. Pass newDoc + live island refs so
	// custom morph strategies (e.g. Alpine.morph) can preserve both Alpine
	// and island state. Call e.preventDefault() to skip the default swap.
	const mountedIslands = new Set(mounted.keys());
	const useDefault = document.dispatchEvent(
		new CustomEvent("atollic:before-morph", {
			cancelable: true,
			detail: { newDoc, mountedIslands },
		}),
	);

	if (useDefault) {
		// Snapshot mounted islands before morph to detect removals
		const before = new Set(mounted.keys());

		const Idiomorph = await getIdiomorph();
		Idiomorph.morph(document.body, newDoc.body, {
			morphStyle: "outerHTML",
			callbacks: {
				// Skip island subtrees — hydrated components own their DOM and state.
				beforeNodeMorphed: (...args: unknown[]) => {
					const oldNode = args[0] as Node;
					return !(
						oldNode.nodeType === Node.ELEMENT_NODE &&
						(oldNode as Element).hasAttribute(ISLAND_ATTR)
					);
				},
			},
		});

		// Dispose islands whose elements were removed by the morph
		for (const el of before) {
			if (!el.isConnected) disposeIsland(el);
		}
	}

	// Sync <title>
	const newTitle = newDoc.querySelector("title");
	if (newTitle) document.title = newTitle.textContent || "";

	// Mount any new islands introduced by the swap
	await mountIslands();
	replacing = false;

	document.dispatchEvent(
		new CustomEvent("atollic:after-morph", {
			detail: { defaultSwap: useDefault },
		}),
	);
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

export function initRuntime(): void {
	// Record all islands present at page load so hydrateIsland is used for them.
	for (const el of document.querySelectorAll<HTMLElement>(ISLAND_SELECTOR)) {
		ssrIslands.add(el);
	}

	mountIslands().then(() => {
		// Early listeners use the event; late checks use the flag.
		(window as unknown as { __atollicReady: boolean }).__atollicReady = true;
		document.dispatchEvent(new CustomEvent("atollic:ready"));
	});

	// --- MutationObserver for dynamic content ---------------------------------
	if (registry.size > 0) {
		let mountQueued = false;
		const observer = new MutationObserver((mutations) => {
			if (replacing) return;
			for (const m of mutations) {
				for (const node of m.removedNodes) {
					if (node instanceof HTMLElement) {
						if (node.hasAttribute(ISLAND_ATTR)) {
							disposeIsland(node);
						}
						for (const child of node.querySelectorAll<HTMLElement>(
							ISLAND_SELECTOR,
						)) {
							disposeIsland(child);
						}
					}
				}
				if (!mountQueued) {
					for (const node of m.addedNodes) {
						if (node instanceof HTMLElement) {
							if (
								node.hasAttribute(ISLAND_ATTR) ||
								node.querySelector(ISLAND_SELECTOR)
							) {
								mountQueued = true;
								queueMicrotask(() => {
									mountQueued = false;
									mountIslands();
								});
								break;
							}
						}
					}
				}
			}
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}

	// --- HMR: refetch & morph on server-side changes ------------------------
	if (import.meta.hot) {
		import.meta.hot.on(HMR_RELOAD_EVENT, async () => {
			try {
				const res = await fetch(window.location.href, {
					headers: { "X-Atollic-HMR": "1" },
				});
				const html = await res.text();
				await morphPage(html);
				console.log("[atollic] Server HMR applied");
			} catch (err) {
				console.warn("[atollic] Server HMR failed, full reload", err);
				window.location.reload();
			}
		});
	}
}
