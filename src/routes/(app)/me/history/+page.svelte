<script lang="ts">
	import History from '@lucide/svelte/icons/history';
</script>

<div class="sticky top-0 z-50">
	<div class="absolute inset-0 bg-base-100"></div>
	<div class="relative container mx-auto flex h-14 items-center gap-2 px-4">
		<h1 class="text-lg font-bold">Reading History</h1>
	</div>
</div>

<div class="flex flex-col items-center gap-4 py-20 text-center">
	<div class="rounded-full bg-base-200 p-4">
		<History class="size-12 text-primary" />
	</div>
	<p class="font-semibold">No history yet</p>
	<p class="text-sm text-base-content/50">Chapters you read will appear here.</p>
</div>
