<script lang="ts">
	import './+layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import DarkModeSwitch from '$lib/components/DarkModeSwitch.svelte';

	let { children } = $props();

	let isDarkMode = $state<boolean>(false);

	onMount(() => {
		const stored = localStorage.getItem('isDarkMode');
		isDarkMode = stored === 'true';

		updateDom();
	});

	function updateDom() {
		console.log(document.documentElement);
		document.documentElement.classList.toggle('dark', isDarkMode);
	}

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		localStorage.setItem('isDarkMode', String(isDarkMode));
		updateDom();
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="flex justify-end">
	<div class="mx-10 my-6">
		<DarkModeSwitch {isDarkMode} {toggleDarkMode} />
	</div>
</div>

{@render children()}
