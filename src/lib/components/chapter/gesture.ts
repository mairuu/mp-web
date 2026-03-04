import type { Action } from 'svelte/action';

const LONG_PRESS_DURATION = 300;
const SCROLL_CANCEL_THRESHOLD = 10;

export type GestureParams = {
	onTap: () => void;
	onDragStart: (e: MouseEvent | TouchEvent, node: HTMLElement) => void;
};

/**
 * svelte action that distinguishes between a tap/click and a drag-start gesture.
 * - mouse: any movement after mousedown triggers drag; releasing without movement triggers tap.
 * - touch: a long-press triggers drag (with haptic feedback); a quick tap triggers tap;
 *   significant finger movement before the timer fires cancels the gesture (allows scrolling).
 */
export const gesture: Action<HTMLElement, GestureParams> = (node, params) => {
	let { onTap, onDragStart } = params;
	let isDragging = false;
	let longPressTimer: ReturnType<typeof setTimeout>;
	let startX = 0;
	let startY = 0;

	// --- mouse ---

	function handleMouseDown(e: MouseEvent) {
		if (e.button !== 0) return; // only left-click
		e.preventDefault();
		isDragging = false;
		scheduleLongPress(e);
		node.addEventListener('mousemove', handleMouseMove);
		node.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(e: MouseEvent) {
		e.preventDefault();
		if (isDragging) return;
		startDrag(e);
		node.removeEventListener('mousemove', handleMouseMove);
	}

	function handleMouseUp(e: MouseEvent) {
		e.preventDefault();
		clearTimeout(longPressTimer);
		if (!isDragging) onTap();
		isDragging = false;
		node.removeEventListener('mousemove', handleMouseMove);
		node.removeEventListener('mouseup', handleMouseUp);
	}

	// --- touch ---

	function handleTouchStart(e: TouchEvent) {
		isDragging = false;
		startX = e.touches[0].clientX;
		startY = e.touches[0].clientY;
		scheduleLongPress(e);
		node.addEventListener('touchmove', handleTouchMove, { passive: false });
		node.addEventListener('touchend', handleTouchEnd);
	}

	function handleTouchMove(e: TouchEvent) {
		if (isDragging) {
			// drag is now tracked at the window level — stop listening here
			e.preventDefault();
			node.removeEventListener('touchmove', handleTouchMove);
			node.removeEventListener('touchend', handleTouchEnd);
			return;
		}

		const dx = e.touches[0].clientX - startX;
		const dy = e.touches[0].clientY - startY;
		if (Math.hypot(dx, dy) > SCROLL_CANCEL_THRESHOLD) {
			// finger moved — user wants to scroll, cancel long-press
			clearTimeout(longPressTimer);
			node.removeEventListener('touchmove', handleTouchMove);
			node.removeEventListener('touchend', handleTouchEnd);
		}
	}

	function handleTouchEnd() {
		clearTimeout(longPressTimer);
		if (!isDragging) onTap();
		isDragging = false;
		node.removeEventListener('touchmove', handleTouchMove);
		node.removeEventListener('touchend', handleTouchEnd);
	}

	// --- shared ---

	function scheduleLongPress(e: MouseEvent | TouchEvent) {
		longPressTimer = setTimeout(() => {
			startDrag(e);
			if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
				navigator?.vibrate?.(50);
			}
		}, LONG_PRESS_DURATION);
	}

	function startDrag(e: MouseEvent | TouchEvent) {
		clearTimeout(longPressTimer);
		isDragging = true;
		onDragStart(e, node);
	}

	node.addEventListener('mousedown', handleMouseDown);
	node.addEventListener('touchstart', handleTouchStart, { passive: false });

	return {
		update(newParams) {
			onTap = newParams.onTap;
			onDragStart = newParams.onDragStart;
		},
		destroy() {
			clearTimeout(longPressTimer);
			node.removeEventListener('mousedown', handleMouseDown);
			node.removeEventListener('touchstart', handleTouchStart);
			node.removeEventListener('mousemove', handleMouseMove);
			node.removeEventListener('mouseup', handleMouseUp);
			node.removeEventListener('touchmove', handleTouchMove);
			node.removeEventListener('touchend', handleTouchEnd);
		}
	};
};
