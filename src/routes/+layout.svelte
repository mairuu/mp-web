<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		document.documentElement.style.backgroundColor = '';
		const bgColor = getComputedStyle(document.documentElement).backgroundColor;
		localStorage.setItem('bg-color', bgColor);
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
