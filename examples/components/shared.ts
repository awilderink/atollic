import { createSignal } from "solid-js";

/** Shared reactive panels state — works across independent island roots. */
const panels = new Map<string, ReturnType<typeof createSignal<boolean>>>();

function getPanel(id: string) {
	if (!panels.has(id)) {
		panels.set(id, createSignal(false));
	}
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by has() check above
	return panels.get(id)!;
}

export function usePanelOpen(id: string) {
	return getPanel(id)[0];
}

export function togglePanel(id: string) {
	const [, set] = getPanel(id);
	set((o) => !o);
}
