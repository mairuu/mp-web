<script lang="ts">
	import House from '@lucide/svelte/icons/house';
	import Settings2 from '@lucide/svelte/icons/settings-2';
	import PanelLeftOpen from '@lucide/svelte/icons/panel-left-open';
	import LibraryBig from '@lucide/svelte/icons/library-big';
	import { createMatchMedia } from '$lib/mediaQuery.svelte';

	const smallScreen = createMatchMedia('(max-width: 640px)');
	const useDockNav = $derived(smallScreen.matches);

	const { children } = $props();
</script>

{#if useDockNav}
	{@render children()}

	<div class="h-[calc(3.5rem+env(safe-area-inset-bottom))]"></div>

	<div class="dock dock-sm z-10">
		<button>
			<House class="size-4" />
			<span class="dock-label">Home</span>
		</button>

		<button>
			<LibraryBig class="size-4" />
			<span class="dock-label">Library</span>
		</button>

		<button>
			<Settings2 class="size-4" />
			<span class="dock-label">Settings</span>
		</button>
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
				class="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64"
			>
				<ul class="menu w-full grow">
					<label for="app-scaffold" aria-label="open sidebar" class="btn btn-square btn-ghost">
						<PanelLeftOpen class="my-1.5 inline-block size-4" />
					</label>

					<li>
						<button
							class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
							data-tip="Homepage"
						>
							<House class="my-1.5 inline-block size-4" />
							<span class="is-drawer-close:hidden">Home</span>
						</button>
					</li>

					<li>
						<button
							class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
							data-tip="Library"
						>
							<LibraryBig class="my-1.5 inline-block size-4" />
							<span class="is-drawer-close:hidden">Library</span>
						</button>
					</li>

					<li>
						<button
							class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
							data-tip="Settings"
						>
							<Settings2 class="my-1.5 inline-block size-4" />
							<span class="is-drawer-close:hidden">Settings</span>
						</button>
					</li>
				</ul>
			</div>
		</div>
	</div>
{/if}
