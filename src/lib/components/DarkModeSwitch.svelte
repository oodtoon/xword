<script lang="ts">
	import Sun from './icons/Sun.svelte';
	import Moon from './icons/Moon.svelte';

	let { isDarkMode, toggleDarkMode }: { isDarkMode: boolean; toggleDarkMode: () => void } =
		$props();
</script>

<div class="relative inline-flex h-9 w-14 items-center">
	<input
		id="switch-component"
		type="checkbox"
		checked={isDarkMode}
		onchange={toggleDarkMode}
		class="switch peer absolute inset-0 cursor-pointer appearance-none rounded-full
		       bg-blue-200 transition-colors duration-300
		       checked:bg-slate-800"
	/>

	<label
		for="switch-component"
		class="toggle pointer-events-none relative z-10 ml-1
		       flex h-8 w-8 items-center justify-center
		       rounded-full border border-slate-300 shadow-sm
		       transition-transform duration-300
		       peer-checked:translate-x-5 peer-checked:border-slate-800"
	>
		{#if isDarkMode}
			<Moon />
		{:else}
			<Sun />
		{/if}
		<span class="sr-only">Dark Mode</span>
	</label>
</div>
