<script lang="ts">
	import { resolve } from '$app/paths';
	import { auth } from '$lib/auth/auth.svelte';
</script>

<div class="sticky top-0 z-50">
	<div class="absolute inset-0 bg-base-100"></div>
	<div class="relative container mx-auto flex h-14 items-center gap-2 px-2"></div>
</div>

<div class="container mx-auto px-4 py-6">
	{#if !auth.isLoggedIn}
		<div class="flex flex-col items-center gap-4 py-12">
			<p class="text-base-content/60">You are not logged in.</p>
			<a href={resolve('/(auth)/login')} class="btn btn-primary">Login</a>
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			<p class="text-lg">Welcome, <span class="font-semibold">{auth.displayName}</span></p>

			<a href={resolve('/(app)/manga/create')} class="btn btn-primary">Create Manga</a>
			<a href={resolve('/(app)/me/manga')} class="btn btn-secondary">Your Manga</a>

			<button class="btn w-fit btn-error" onclick={auth.logout}>Logout</button>
		</div>
	{/if}
</div>
