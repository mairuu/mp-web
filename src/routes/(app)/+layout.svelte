<script lang="ts">
	import House from '@lucide/svelte/icons/house';
	import PanelLeftOpen from '@lucide/svelte/icons/panel-left-open';
	import User from '@lucide/svelte/icons/user';
	import BookMarked from '@lucide/svelte/icons/book-marked';
	import History from '@lucide/svelte/icons/history';
	import BookOpen from '@lucide/svelte/icons/book-open';

	import { createMatchMedia } from '$lib/mediaQuery.svelte';
	import type { ResolvedPathname } from '$app/types';
	import { page } from '$app/state';

	const smallScreen = createMatchMedia('(max-width: 640px)');
	const useDockNav = $derived(smallScreen.matches);

	type MenuEntry = {
		label: string;
		icon: typeof House;
		url: ResolvedPathname;
		children?: MenuEntry[];
	};

	const links: MenuEntry[] = [
		{ label: 'Home', icon: House, url: '/' },
		{
			label: 'You',
			icon: User,
			url: '/me',
			children: [
				{ label: 'History', icon: History, url: '/me/history' },
				{ label: 'Library', icon: BookMarked, url: '/me/library' },
				{ label: 'Your Manga', icon: BookOpen, url: '/me/manga' }
			]
		}
	];

	const { children } = $props();

	let dockHidden = $state(false);
	let acc = 0;
	let lastScrollY = 0;

	function handleScroll() {
		if (!useDockNav) return;

		const currentScrollY = window.scrollY;

		if (
			currentScrollY <= 56 ||
			currentScrollY + window.innerHeight >= document.documentElement.scrollHeight - 56
		) {
			dockHidden = false;
			return;
		}

		acc += currentScrollY - lastScrollY;

		if (acc > 50) {
			dockHidden = true;
			acc = 0;
		} else if (acc < -50) {
			dockHidden = false;
			acc = 0;
		}

		lastScrollY = currentScrollY;
	}
</script>

<svelte:window on:scroll={handleScroll} />

{#if useDockNav}
	{@render children()}

	<div class="h-[calc(3.5rem+env(safe-area-inset-bottom))]"></div>

	<div class="dock dock-sm z-10 transition-transform" class:translate-y-full={dockHidden}>
		{#each links as link, i (i)}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={link.url} class="dock-item" class:dock-active={link.url === page.url.pathname}>
				<link.icon class="size-4" />
				<span class="dock-label">{link.label}</span>
			</a>
		{/each}
	</div>
{:else}
	<div class="drawer sm:drawer-open">
		<input id="app-scaffold" type="checkbox" class="drawer-toggle" defaultChecked={true} />
		<div class="relative drawer-content">
			{@render children()}
		</div>

		<div class="drawer-side overflow-visible">
			<label for="app-scaffold" aria-label="close sidebar" class="drawer-overlay"></label>

			<div
				class="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-16 is-drawer-open:w-64"
			>
				<div class="sticky top-0 z-10 flex h-14 w-full items-center bg-base-200 px-2">
					<label for="app-scaffold" aria-label="open sidebar" class="btn w-full p-0 btn-ghost">
						<PanelLeftOpen class="my-2 inline-block size-5 is-drawer-open:rotate-180" />
					</label>
				</div>

				<ul class="menu w-full grow">
					{#each links as link, i (i)}
						{@render nestedmenu(link)}
						{#if i !== links.length - 1}
							<div class="divider1"></div>
						{/if}
					{/each}
				</ul>
			</div>
		</div>
	</div>
{/if}

{#snippet nestedmenu(entry: MenuEntry)}
	<li>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={entry.url} class:menu-active={entry.url === page.url.pathname}>
			<entry.icon class="mx-0.5 my-2 inline-block size-5" />
			<span class="is-drawer-close:hidden">{entry.label}</span>
		</a>
		{#if entry.children}
			<ul class="is-drawer-close:m-0 is-drawer-close:p-0">
				{#each entry.children as child, j (j)}
					{@render nestedmenu(child)}
				{/each}
			</ul>
		{/if}
	</li>
{/snippet}
