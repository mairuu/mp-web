type PullToNextOptions = {
	maxPull?: number;
	threshold?: number;
};

export function createPullToNext(onTrigger: () => void, options: PullToNextOptions = {}) {
	const { maxPull = 60, threshold = 50 } = options;

	let pullHeight = $state(0);

	const pullProgress = $derived(Math.min(pullHeight / threshold, 1));
	const isTriggered = $derived(pullHeight >= threshold);

	let startY = 0;

	function isAtBottom() {
		return window.scrollY + window.innerHeight >= document.body.scrollHeight - 8;
	}

	function reset() {
		pullHeight = 0;
		window.removeEventListener('touchmove', onTouchMove);
		window.removeEventListener('touchend', onTouchEnd);
	}

	function onTouchStart(e: TouchEvent) {
		if (!isAtBottom()) return;
		startY = e.touches[0].screenY;
		window.addEventListener('touchmove', onTouchMove, { passive: false });
		window.addEventListener('touchend', onTouchEnd);
	}

	function onTouchMove(e: TouchEvent) {
		const diff = e.touches[0].screenY - startY;

		if (diff > 0) {
			reset();
			return;
		}

		// ease-in resistance: light at start, heavy near MAX_PULL
		const t = Math.min(-diff / (maxPull * 2), 1);
		const next = maxPull * (t * t);

		if (next >= 0) e.preventDefault();
		pullHeight = next;
	}

	function onTouchEnd() {
		if (isTriggered) onTrigger();
		reset();
	}

	// idempotent
	function enable() {
		console.info('enabling pull-to-next');
		window.addEventListener('touchstart', onTouchStart, { passive: false });
	}

	// idempotent
	function disable() {
		console.info('disabling pull-to-next');
		window.removeEventListener('touchstart', onTouchStart);
		window.removeEventListener('touchmove', onTouchMove);
		window.removeEventListener('touchend', onTouchEnd);
		reset();
	}

	return {
		enable,
		disable,
		get pullHeight() {
			return pullHeight;
		},
		get isTriggered() {
			return isTriggered;
		},
		get pullProgress() {
			return pullProgress;
		}
	};
}
