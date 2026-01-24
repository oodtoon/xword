<script lang="ts">
	import './+layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';

	let { children } = $props();

	let isDarkMode = $state<boolean>(false);

	onMount(() => {
		const stored = localStorage.getItem('isDarkMode');
		isDarkMode = stored === 'true';

		updateDom();
	});

	function updateDom() {
		console.log(document.documentElement)
		document.documentElement.classList.toggle('dark', isDarkMode);
	}

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		console.log(isDarkMode)
		localStorage.setItem('isDarkMode', String(isDarkMode));
		updateDom();
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="flex justify-end">
	<div class="mx-10 my-6">
		<label for="dark-mode-toggle">Dark Mode</label>
		<input type="checkbox" id="dark-mode-toggle" checked={isDarkMode} onchange={toggleDarkMode} />
	</div>
</div>

{@render children()}
