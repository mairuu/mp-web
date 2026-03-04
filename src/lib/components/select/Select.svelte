<script lang="ts" module>
	export type SelectOption<T> = {
		value: T;
		label: string;
		description?: string;
	};
</script>

<script lang="ts" generics="T">
	// import { ChevronDown } from '@lucide/svelte';
	let {
		options,
		value = $bindable(),
		placeholder = 'options'
	}: {
		options: SelectOption<T>[];
		value?: T;
		placeholder?: string;
	} = $props();

	let detailsEl: HTMLDetailsElement;

	let selectedOption = $derived(options.find((o) => o.value === value));

	function select(option: SelectOption<T>) {
		value = option.value;
		detailsEl.open = false;
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.closest('.custom-select') !== detailsEl) {
			detailsEl.open = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<details class="dropdown w-full" bind:this={detailsEl}>
	<summary class="btn btn-block justify-between font-normal">
		{#if selectedOption}
			<span>{selectedOption.label}</span>
		{:else}
			<span class="text-base-content/50">{placeholder}</span>
		{/if}
		<!-- <ChevronDown class="details-open:rotate-180 h-4 w-4 transition-transform" /> -->
	</summary>

	<ul
		class="dropdown-content menu z-10 mt-1 w-full rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
	>
		{#each options as option (option.value)}
			<li>
				<button
					type="button"
					class="flex flex-col items-start gap-0.5"
					class:bg-base-300={value === option.value}
					onclick={() => select(option)}
				>
					<span class="font-medium">{option.label}</span>
					<span class="text-xs text-base-content/60">{option.description}</span>
				</button>
			</li>
		{/each}
	</ul>
</details>
