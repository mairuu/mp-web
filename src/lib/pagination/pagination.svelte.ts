import { type Paged, type Pagination } from '$lib/api/api';

export type FetchFn<T> = (page: number, pageSize: number) => Promise<Paged<T>>;

export function createPagination<T>(fetchFn: FetchFn<T>, initialPageSize = 20) {
	let items = $state<T[]>([]);
	let pagination = $state<Pagination>({
		total_items: 0,
		total_pages: 0,
		page: 1,
		page_size: initialPageSize
	});
	let loading = $state(false);
	let error = $state<Error | null>(null);

	const canPrev = $derived(pagination.page > 1);
	const canNext = $derived(pagination.page < pagination.total_pages);
	const isEmpty = $derived(!loading && items.length === 0);
	const pageRange = $derived(getPageRange(pagination.page, pagination.total_pages));

	async function load(page = pagination.page, pageSize = pagination.page_size) {
		loading = true;
		error = null;
		try {
			const result = await fetchFn(page, pageSize);
			items = result.items;
			pagination = result.pagination;
		} catch (e) {
			error = e instanceof Error ? e : new Error(String(e));
		} finally {
			loading = false;
		}
	}

	async function goTo(page: number) {
		if (page < 1 || page > pagination.total_pages) return;
		await load(page);
	}

	async function next() {
		if (canNext) await goTo(pagination.page + 1);
	}

	async function prev() {
		if (canPrev) await goTo(pagination.page - 1);
	}

	async function first() {
		await goTo(1);
	}

	async function last() {
		await goTo(pagination.total_pages);
	}

	async function setPageSize(size: number) {
		await load(1, size);
	}

	return {
		get items() {
			return items;
		},
		get pagination() {
			return pagination;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		get canPrev() {
			return canPrev;
		},
		get canNext() {
			return canNext;
		},
		get isEmpty() {
			return isEmpty;
		},
		get pageRange() {
			return pageRange;
		},
		load,
		goTo,
		next,
		prev,
		first,
		last,
		setPageSize
	};
}

// returns a windowed list of page numbers with `null` as ellipsis markers.
function getPageRange(current: number, total: number, window = 2): (number | null)[] {
	if (total <= 1) return total === 1 ? [1] : [];

	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const pages = new Set<number>();
	pages.add(1);
	pages.add(total);
	for (let i = Math.max(2, current - window); i <= Math.min(total - 1, current + window); i++) {
		pages.add(i);
	}

	const sorted = [...pages].sort((a, b) => a - b);
	const result: (number | null)[] = [];

	for (let i = 0; i < sorted.length; i++) {
		if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(null); // ellipsis
		result.push(sorted[i]);
	}

	return result;
}
