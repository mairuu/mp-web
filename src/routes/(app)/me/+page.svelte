<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import BookMarked from '@lucide/svelte/icons/book-marked';
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import History from '@lucide/svelte/icons/history';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Settings from '@lucide/svelte/icons/settings';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	import { resolve } from '$app/paths';
	import { auth } from '$lib/auth/auth.svelte';

	const initials = $derived(
		auth.displayName
			?.split(/[\s_]/)
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('') ?? '?'
	);
</script>

<div class="sticky top-0 z-50">
	<div class="absolute inset-0 bg-base-100"></div>
	<div class="relative container mx-auto flex h-14 items-center gap-2 px-4">
		<h1 class="text-lg font-bold">Profile</h1>
	</div>
</div>

<div class="container mx-auto px-4">
	{#if !auth.isLoggedIn}
		<div class="flex flex-col items-center gap-6 py-20">
			<div class="flex flex-col items-center gap-2 text-center">
				<div class="grid size-20 place-items-center rounded-full bg-base-200 text-3xl">👤</div>
				<p class="font-semibold">Not logged in</p>
				<p class="text-sm text-base-content/60">Sign in to access your profile and content.</p>
			</div>
			<a href={resolve('/(auth)/login')} class="btn w-full max-w-xs btn-primary">Login</a>
			<a href={resolve('/(auth)/register')} class="link text-sm link-primary">
				Don't have an account? Register
			</a>
		</div>
	{:else}
		<div class="my-3 mb-6 flex items-center gap-4 rounded-box bg-base-200 p-4">
			<div
				class="grid size-14 shrink-0 place-items-center rounded-full bg-primary text-xl font-bold text-primary-content"
			>
				{initials}
			</div>
			<div class="min-w-0">
				<p class="truncate font-semibold">{auth.displayName}</p>
				<p class="truncate text-sm text-base-content/50">{auth.user?.email}</p>
			</div>
		</div>

		<!-- Library section -->
		<p class="mb-2 px-1 text-xs font-semibold tracking-widest text-base-content/50 uppercase">
			Library
		</p>
		<ul class="mb-6 overflow-hidden rounded-box bg-base-200">
			<li class="border-b border-base-content/10 last:border-b-0">
				<a
					href={resolve('/(app)/me/history')}
					class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-base-300"
				>
					<History class="size-5 shrink-0 text-primary" />
					<span class="flex-1 font-medium">History</span>
					<ChevronRight class="size-4 shrink-0 text-base-content/30" />
				</a>
			</li>
			<li class="border-b border-base-content/10 last:border-b-0">
				<a
					href={resolve('/(app)/me/library')}
					class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-base-300"
				>
					<BookMarked class="size-5 shrink-0 text-primary" />
					<span class="flex-1 font-medium">Library</span>
					<ChevronRight class="size-4 shrink-0 text-base-content/30" />
				</a>
			</li>
		</ul>

		<!-- Creator section -->
		<p class="mb-2 px-1 text-xs font-semibold tracking-widest text-base-content/50 uppercase">
			Creator
		</p>
		<ul class="mb-6 overflow-hidden rounded-box bg-base-200">
			<li class="border-b border-base-content/10 last:border-b-0">
				<a
					href={resolve('/(app)/me/manga')}
					class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-base-300"
				>
					<BookOpen class="size-5 shrink-0 text-primary" />
					<span class="flex-1 font-medium">Your Manga</span>
					<ChevronRight class="size-4 shrink-0 text-base-content/30" />
				</a>
			</li>
			<li class="border-b border-base-content/10 last:border-b-0">
				<a
					href={resolve('/(app)/manga/create')}
					class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-base-300"
				>
					<CirclePlus class="size-5 shrink-0 text-primary" />
					<span class="flex-1 font-medium">Create Manga</span>
					<ChevronRight class="size-4 shrink-0 text-base-content/30" />
				</a>
			</li>
		</ul>

		<p class="mb-2 px-1 text-xs font-semibold tracking-widest text-base-content/50 uppercase">
			Account
		</p>
		<ul class="overflow-hidden rounded-box bg-base-200">
			<li class="border-b border-base-content/10 last:border-b-0">
				<a
					href={resolve('/(app)/me/settings')}
					class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-base-300"
				>
					<Settings class="size-5 shrink-0 text-primary" />
					<span class="flex-1 font-medium">Settings & Preferences</span>
					<ChevronRight class="size-4 shrink-0 text-base-content/30" />
				</a>
			</li>
			<li>
				<button
					class="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-base-300"
					onclick={auth.logout}
				>
					<LogOut class="size-5 shrink-0 text-error" />
					<span class="flex-1 text-left font-medium text-error">Logout</span>
				</button>
			</li>
		</ul>
	{/if}
</div>
