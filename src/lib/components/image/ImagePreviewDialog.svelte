<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	let { imageUrl = $bindable() }: { imageUrl: string | null } = $props();
</script>

{#if imageUrl}
	<dialog
		class="modal-open modal"
		onclick={(e) => {
			e.stopPropagation();
		}}
	>
		<div class="modal-box max-h-svh w-fit max-w-svw p-0">
			<button
				class="btn absolute top-2 right-2 btn-circle btn-sm"
				onclick={() => (imageUrl = null)}
			>
				<X class="h-4 w-4" />
			</button>
			<img
				src={imageUrl}
				alt="Preview"
				class="max-h-[calc(100svh-2rem)] max-w-[calc(100svw-2rem)]"
			/>
		</div>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-backdrop cursor-pointer" onclick={() => (imageUrl = null)}></div>
	</dialog>
{/if}
