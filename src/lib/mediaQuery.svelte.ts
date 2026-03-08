import { onMount } from 'svelte';

export function createMatchMedia(query: string) {
	const mql = typeof window !== 'undefined' ? window.matchMedia(query) : null;
	let matches = $state(mql?.matches ?? false);

	onMount(() => {
		if (!mql) return;

		function updateMatches(e: MediaQueryListEvent) {
			matches = e.matches;
		}

		mql.addEventListener('change', updateMatches);
		return () => {
			mql.removeEventListener('change', updateMatches);
		};
	});

	return {
		get matches() {
			return matches;
		}
	};
}
