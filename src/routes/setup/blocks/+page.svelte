<script lang="ts">
	import Grid from '$lib/components/Grid.svelte';
	import LinkButton from '$lib/components/LinkButton.svelte';
	import { initGrid } from '$lib/stores/crossword.js';
	import { crossword } from '$lib/stores/crossword.js';

	initGrid();

	let data = $derived(crossword);
	console.log($data);

	function toggleBlock(r: number, c: number) {
		crossword.update((old) => {
			const newGrid = old.grid.map((row, ri) =>
				row.map((cell, ci) => (ri === r && ci === c ? { ...cell, isBlock: !cell.isBlock } : cell))
			);
			return { ...old, grid: newGrid };
		});
	}
</script>

<div class="flex justify-center">
	<Grid>
		{#each $data.grid as row, r}
			{#each row as cell, c}
				<button
					aria-label={`square-${r}-${c}`}
					class="flex items-center justify-center border border-black
  {cell.isBlock ? 'bg-black' : 'bg-white'}"
					onclick={() => toggleBlock(r, c)}
				></button>
			{/each}
		{/each}
	</Grid>
</div>

<LinkButton href="/setup/numbers">Next: Assign Numbers →</LinkButton>
