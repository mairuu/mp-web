<script lang="ts">
	import House from '@lucide/svelte/icons/house';
	import Settings2 from '@lucide/svelte/icons/settings-2';
	import PanelLeftOpen from '@lucide/svelte/icons/panel-left-open';
	import LibraryBig from '@lucide/svelte/icons/library-big';
	import { createMatchMedia } from '$lib/mediaQuery.svelte';
	import type { ResolvedPathname } from '$app/types';
	import { page } from '$app/state';

	const smallScreen = createMatchMedia('(max-width: 640px)');
	const useDockNav = $derived(smallScreen.matches);

	const links: {
		label: string;
		icon: typeof House;
		url: ResolvedPathname;
	}[] = [
		{ label: 'Home', icon: House, url: '/' },
		{ label: 'Library', icon: LibraryBig, url: '/library' },
		{ label: 'Settings', icon: Settings2, url: '/settings' }
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

		<div class="drawer-side is-drawer-close:overflow-visible">
			<label for="app-scaffold" aria-label="close sidebar" class="drawer-overlay"></label>

			<div
				class="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-16 is-drawer-open:w-64"
			>
				<div class="flex h-14 w-full items-center border-b border-base-content/10 px-2">
					<label for="app-scaffold" aria-label="open sidebar" class="btn w-full p-0 btn-ghost">
						<PanelLeftOpen class="my-2 inline-block size-5 is-drawer-open:rotate-180" />
					</label>
				</div>

				<ul class="menu w-full grow">
					{#each links as link, i (i)}
						<li>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={link.url} class:menu-active={link.url === page.url.pathname}>
								<link.icon class="mx-0.5 my-2 inline-block size-5" />
								<span class="is-drawer-close:hidden">{link.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
{/if}
