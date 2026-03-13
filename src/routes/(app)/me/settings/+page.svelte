<script lang="ts">
	import Settings from '@lucide/svelte/icons/settings';
</script>

<div class="sticky top-0 z-50">
	<div class="absolute inset-0 bg-base-100"></div>
	<div class="relative container mx-auto flex h-14 items-center gap-2 px-4">
		<h1 class="text-lg font-bold">Settings</h1>
	</div>
</div>

<div class="flex flex-col items-center gap-4 py-20 text-center">
	<div class="rounded-full bg-base-200 p-4">
		<Settings class="size-12 text-primary" />
	</div>
	<p class="font-semibold">Settings</p>
	<p class="text-sm text-base-content/50">Settings will be available soon.</p>
</div>
